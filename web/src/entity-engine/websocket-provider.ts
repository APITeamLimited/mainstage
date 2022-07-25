/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import * as bc from 'lib0/broadcastchannel'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as math from 'lib0/math'
import { Observable } from 'lib0/observable'
import * as time from 'lib0/time'
import * as url from 'lib0/url'
import * as authProtocol from 'y-protocols/auth'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import * as syncProtocol from 'y-protocols/sync'

const messageSync = 0
const messageQueryAwareness = 3
const messageAwareness = 1
const messageAuth = 2

const messageHandlers: Array<
  (
    arg0: encoding.Encoder,
    arg1: decoding.Decoder,
    arg2: WebsocketProvider,
    arg3: boolean,
    arg4: number
  ) => void
> = []

type MessageHandlersType = typeof messageHandlers

messageHandlers[messageSync] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  encoding.writeVarUint(encoder, messageSync)
  const syncMessageType = syncProtocol.readSyncMessage(
    decoder,
    encoder,
    provider.doc,
    provider
  )
  if (
    emitSynced &&
    syncMessageType === syncProtocol.messageYjsSyncStep2 &&
    !provider.synced
  ) {
    provider.synced = true
  }
}

messageHandlers[messageQueryAwareness] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  encoding.writeVarUint(encoder, messageAwareness)
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  )
}

messageHandlers[messageAwareness] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  awarenessProtocol.applyAwarenessUpdate(
    provider.awareness,
    decoding.readVarUint8Array(decoder),
    provider
  )
}

messageHandlers[messageAuth] = (
  encoder,
  decoder,
  provider,
  emitSynced,
  messageType
) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler)
}

// todo: This should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000

const permissionDeniedHandler = (provider: WebsocketProvider, reason: string) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`)

const readMessage = (
  provider: WebsocketProvider,
  buf: Uint8Array,
  emitSynced: boolean
): encoding.Encoder => {
  const decoder = decoding.createDecoder(buf)
  const encoder = encoding.createEncoder()
  const messageType = decoding.readVarUint(decoder)
  const messageHandler = provider.messageHandlers[messageType]

  if (messageHandler) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType)
  } else {
    console.error('Unable to compute message')
  }

  return encoder
}

const broadcastMessage = (provider: WebsocketProvider, buf: ArrayBuffer) => {
  if (provider.wsconnected && provider.ws !== null) {
    provider.ws.send(buf)
  }
  if (provider.bcconnected) {
    bc.publish(provider.bcChannel, buf, provider)
  }
}

/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url
 */
export class WebsocketProvider extends Observable<string> {
  maxBackoffTime: number
  bcChannel: string
  url: string
  scopeId: string
  doc: Y.Doc
  awareness: awarenessProtocol.Awareness
  wsconnecting: boolean
  wsconnected: boolean
  bcconnected: boolean
  disableBc: boolean
  wsUnsuccessfulReconnects: number
  messageHandlers: MessageHandlersType
  _synced: boolean
  ws: WebSocket | null
  wsLastMessageReceived: number
  shouldConnect: boolean
  _resyncInterval: any
  _bcSubscriber: (data: ArrayBuffer, origin: any) => void
  _updateHandler: (update: Uint8Array, origin: any) => void
  _awarenessUpdateHandler: (
    { added, updated, removed }: any,
    origin: any
  ) => void
  _beforeUnloadHandler: () => void
  _checkInterval: any

  constructor({
    serverUrl,
    scopeId,
    doc,
    options,
  }: {
    serverUrl: string
    scopeId: string
    doc: Y.Doc
    options: {
      connect?: boolean
      // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
      awareness?: awarenessProtocol.Awareness
      // Specify a query-string that will be url-encoded and attached to the `serverUrl`
      // I.e. params = { auth: "bearer" } will be transformed to "?auth=bearer"
      params?: { [key: string]: string }
      resyncInterval?: number
      // Specify the maximum amount to wait between reconnects (we use exponential backoff).
      maxBackoffTime?: number
      disableBc?: boolean
    }
  }) {
    const {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      resyncInterval = -1,
      maxBackoffTime = 2500,
      disableBc = false,
    } = options || {}

    super()

    // ensure that url is always ends with /
    while (serverUrl[serverUrl.length - 1] === '/') {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1)
    }
    const encodedParams = url.encodeQueryParams(params)
    this.maxBackoffTime = maxBackoffTime
    this.bcChannel = serverUrl + '/' + scopeId
    this.url =
      serverUrl +
      '/' +
      scopeId +
      (encodedParams.length === 0 ? '' : '?' + encodedParams)
    this.scopeId = scopeId
    this.doc = doc
    this.awareness = awareness
    this.wsconnected = false
    this.wsconnecting = false
    this.bcconnected = false
    this.disableBc = disableBc
    this.wsUnsuccessfulReconnects = 0
    this.messageHandlers = messageHandlers.slice()
    this._synced = false
    this.ws = null
    this.wsLastMessageReceived = 0

    // Whether to connect to other peers or not
    this.shouldConnect = connect

    this._resyncInterval = 0

    if (resyncInterval > 0) {
      this._resyncInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // resend sync step 1
          const encoder = encoding.createEncoder()
          encoding.writeVarUint(encoder, messageSync)
          syncProtocol.writeSyncStep1(encoder, doc)
          this.ws.send(encoding.toUint8Array(encoder))
        }
      }, resyncInterval)
    }

    this._bcSubscriber = (data: ArrayBuffer, origin: any) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false)
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder), this)
        }
      }
    }

    // Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
    this._updateHandler = (update: Uint8Array, origin: any) => {
      console.log('_updateHandler')
      if (origin !== this) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        broadcastMessage(this, encoding.toUint8Array(encoder))
      }
    }

    this.doc.on('update', this._updateHandler)

    this._awarenessUpdateHandler = ({ added, updated, removed }: any) =>
      //origin: any old param that was not used, rember it for future reference
      {
        console.log('_awarenessUpdateHandler')

        const changedClients = added.concat(updated).concat(removed)
        const encoder = encoding.createEncoder()

        encoding.writeVarUint(encoder, messageAwareness)
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
        )

        broadcastMessage(this, encoding.toUint8Array(encoder))
      }

    this._beforeUnloadHandler = () => {
      console.log('_beforeUnloadHandler')
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        'window unload'
      )
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._beforeUnloadHandler)
    } else if (typeof process !== 'undefined') {
      process.on('exit', this._beforeUnloadHandler)
    }

    awareness.on('update', this._awarenessUpdateHandler)

    this._checkInterval = setInterval(() => {
      if (
        this.wsconnected &&
        messageReconnectTimeout <
          time.getUnixTime() - this.wsLastMessageReceived
      ) {
        console.log(
          'no message received in a long time - not even your own awareness, disabled closing for now'
        )
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        //this.ws?.close()
      }
    }, messageReconnectTimeout / 10)

    if (connect) {
      this.connect()
    }
  }

  setupWS() {
    console.log('setupWS called', this.shouldConnect, this.ws === null)

    if (this.shouldConnect && this.ws === null) {
      console.log(`Connecting to ${this.url}`)

      this.ws = new WebSocket(this.url)
      this.ws.binaryType = 'arraybuffer'
      this.wsconnecting = true
      this.wsconnected = false
      this.synced = false

      this.ws.onmessage = (event) => {
        console.log(`Received message from ${this.url}`, event)

        this.wsLastMessageReceived = time.getUnixTime()
        const encoder = readMessage(this, new Uint8Array(event.data), true)
        if (encoding.length(encoder) > 1) {
          this.ws?.send(encoding.toUint8Array(encoder))
        }
      }

      this.ws.onerror = (event) => {
        console.log('setupWS: websocket error', event)
        this.emit('connection-error', [event, this])
      }

      this.ws.onclose = (event) => {
        console.log('setupWS: websocket closed', event)
        this.emit('connection-close', [event, this])
        this.ws = null
        this.wsconnecting = false

        if (this.wsconnected) {
          this.wsconnected = false
          this.synced = false
          // update awareness (all users except local left)
          awarenessProtocol.removeAwarenessStates(
            this.awareness,
            Array.from(this.awareness.getStates().keys()).filter(
              (client) => client !== this.doc.clientID
            ),
            this
          )
          this.emit('status', [
            {
              status: 'disconnected',
            },
          ])
        } else {
          this.wsUnsuccessfulReconnects++
        }

        // Start with no reconnect timeout and increase timeout by
        // using exponential backoff starting with 100ms
        console.log('reconnect exp')
        setTimeout(
          this.setupWS,
          math.min(
            math.pow(2, this.wsUnsuccessfulReconnects) * 100,
            this.maxBackoffTime
          ),
          this
        )
      }

      //websocket.onopen = () => {
      //  console.log('setupWS: opened')
      //}

      this.ws.onopen = () => {
        console.log('setupWS: websocket opened')

        this.wsLastMessageReceived = time.getUnixTime()
        this.wsconnecting = false
        this.wsconnected = true
        this.wsUnsuccessfulReconnects = 0

        this.emit('status', [
          {
            status: 'connected',
          },
        ])

        // always send sync step 1 when connected
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeSyncStep1(encoder, this.doc)
        this.ws?.send(encoding.toUint8Array(encoder))

        // broadcast local awareness state
        if (this.awareness.getLocalState() !== null) {
          const encoderAwarenessState = encoding.createEncoder()
          encoding.writeVarUint(encoderAwarenessState, messageAwareness)
          encoding.writeVarUint8Array(
            encoderAwarenessState,
            awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
              this.doc.clientID,
            ])
          )
          this.ws?.send(encoding.toUint8Array(encoderAwarenessState))
        }
      }

      this.emit('status', [
        {
          status: 'connecting',
        },
      ])
    }
  }

  get synced() {
    return this._synced
  }

  set synced(state) {
    if (this._synced !== state) {
      this._synced = state
      this.emit('synced', [state])
      this.emit('sync', [state])
    }
  }

  destroy() {
    console.log('destroy')
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval)
    }
    clearInterval(this._checkInterval)

    this.disconnect()

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler)
    } else if (typeof process !== 'undefined') {
      process.off('exit', this._beforeUnloadHandler)
    }

    this.awareness.off('update', this._awarenessUpdateHandler)
    this.doc.off('update', this._updateHandler)
    super.destroy()
  }

  connectBc() {
    console.log('connectBc')

    if (this.disableBc) {
      return
    }

    if (!this.bcconnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = true
    }

    // send sync step1 to bc
    // write sync step 1
    const encoderSync = encoding.createEncoder()
    encoding.writeVarUint(encoderSync, messageSync)
    syncProtocol.writeSyncStep1(encoderSync, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync), this)

    // broadcast local state
    const encoderState = encoding.createEncoder()
    encoding.writeVarUint(encoderState, messageSync)
    syncProtocol.writeSyncStep2(encoderState, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderState), this)

    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness)

    bc.publish(
      this.bcChannel,
      encoding.toUint8Array(encoderAwarenessQuery),
      this
    )

    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessState, messageAwareness)
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID,
      ])
    )

    bc.publish(
      this.bcChannel,
      encoding.toUint8Array(encoderAwarenessState),
      this
    )
  }

  disconnectBc() {
    console.log('disconnectBc')

    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAwareness)

    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        [this.doc.clientID],
        new Map()
      )
    )

    broadcastMessage(this, encoding.toUint8Array(encoder))

    if (this.bcconnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = false
    }
  }

  disconnect() {
    console.log('disconnect ws exists', this.ws)
    this.shouldConnect = false
    this.disconnectBc()
    if (this.ws !== null) {
      //this.ws.close()
    }
  }

  connect() {
    console.log('connecting to', this.url)
    this.shouldConnect = true
    if (!this.wsconnected && this.ws === null) {
      this.setupWS()
      this.connectBc()
    }
  }

  readMessage(buf: Uint8Array, emitSynced: boolean): encoding.Encoder {
    console.log('readMessage')

    const decoder = decoding.createDecoder(buf)
    const encoder = encoding.createEncoder()
    const messageType = decoding.readVarUint(decoder)
    const messageHandler = this.messageHandlers[messageType]

    if (messageHandler) {
      messageHandler(encoder, decoder, this, emitSynced, messageType)
    } else {
      console.error('Unable to compute message')
    }

    return encoder
  }

  broadcastMessage(buf: ArrayBuffer) {
    console.log('broadcastMessage')

    if (this.wsconnected && this.ws !== null) {
      this.ws.send(buf)
    }
    if (this.bcconnected) {
      bc.publish(this.bcChannel, buf, this)
    }
  }
}
