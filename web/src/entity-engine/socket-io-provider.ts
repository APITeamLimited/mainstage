/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bc from 'lib0/broadcastchannel'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as math from 'lib0/math'
import { Observable } from 'lib0/observable'
import * as time from 'lib0/time'
import { io, protocol, Socket } from 'socket.io-client'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import * as syncProtocol from './sync'
import { PossibleSyncStatus } from './utils'

const getUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    const host = process.env['ENTITY_ENGINE_HOST']
    const port = process.env['ENTITY_ENGINE_PORT']

    if (!(host && port)) {
      throw new Error(
        `ENTITY_ENGINE_HOST and ENTITY_ENGINE_PORT must be set, got ${host} and ${port}`
      )
    }

    return `http://${host}:${port}`
  } else {
    // TODO: Correctly implement env variables
    const gatewayUrl = 'https://apiteam-6pq1lw9jtzb.enterchange.io'

    if (!gatewayUrl) {
      throw new Error('GATEWAY_URL must be set')
    }

    return gatewayUrl
  }
}

// todo: This should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000

const messageSync = 0
const messageAwareness = 1
const messageQueryAwareness = 3

const messageHandlers: Array<
  (
    arg0: encoding.Encoder,
    arg1: decoding.Decoder,
    arg2: SocketIOProvider,
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

  provider.onSyncMessage?.(provider.doc)

  //console.log('syncMessageType:', syncMessageType)

  if (
    emitSynced &&
    syncMessageType === syncProtocol.messageYjsSyncStep2 &&
    !provider.synced
  ) {
    //console.log('Setting as synced')
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
  //console.log('messageQueryAwareness handler')
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
  //console.log('messageAwareness handler')
  provider.onAwarenessUpdate?.(provider.awareness)
}

type ScopeProviderConstructorArgs = {
  scopeId: string
  rawBearer: string
  doc: Y.Doc
  options?: {
    connect?: boolean
    // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
    awareness?: awarenessProtocol.Awareness
    resyncInterval?: number
    // Specify the maximum amount to wait between reconnects (we use exponential backoff).
    maxBackoffTime?: number
    disableBc?: boolean
    onAwarenessUpdate?: (awareness: awarenessProtocol.Awareness) => void
    onStatusChange?: ((status: PossibleSyncStatus) => void) | undefined
    onSyncMessage?: ((newDoc: Y.Doc) => void) | undefined
  }
}

export class SocketIOProvider extends Observable<string> {
  maxBackoffTime: number
  bcChannel: string
  url: string
  scopeId: string
  rawBearer: string
  doc: Y.Doc
  awareness: awarenessProtocol.Awareness
  socketConnecting: boolean
  socketConnected: boolean
  bcConnected: boolean
  disableBc: boolean
  socketUnsuccessfulReconnects: number
  messageHandlers: MessageHandlersType
  _synced: boolean
  socket: Socket | null
  socketLastMessageReceived: number
  shouldConnect: boolean
  _resyncInterval
  _bcSubscriber: (data: ArrayBuffer, origin: any) => void
  _updateHandler: (update: Uint8Array, origin: any) => void
  _awarenessUpdateHandler: (
    { added, updated, removed }: any,
    origin: any
  ) => void
  _beforeUnloadHandler: () => void
  _checkInterval
  onAwarenessUpdate:
    | ((awareness: awarenessProtocol.Awareness) => void)
    | undefined
  onStatusChange: ((status: PossibleSyncStatus) => void) | undefined
  onSyncMessage: ((newDoc: Y.Doc) => void) | undefined

  constructor({
    scopeId,
    rawBearer,
    doc,
    options,
  }: ScopeProviderConstructorArgs) {
    const {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      resyncInterval = -1,
      maxBackoffTime = 2500,
      disableBc = false,
      onAwarenessUpdate = undefined,
      onStatusChange = undefined,
      onSyncMessage = undefined,
    } = options || {}

    super()

    // ensure that url is always ends with /
    this.maxBackoffTime = maxBackoffTime
    this.url = getUrl()
    this.rawBearer = rawBearer
    this.bcChannel = `${this.url}-${scopeId}`
    this.scopeId = scopeId
    this.doc = doc
    this.awareness = awareness
    this.socketConnected = false
    this.socketConnecting = false
    this.bcConnected = false
    this.disableBc = disableBc
    this.socketUnsuccessfulReconnects = 0
    this.messageHandlers = messageHandlers.slice()
    this._synced = false
    this.socket = null
    this.socketLastMessageReceived = 0
    this.onAwarenessUpdate = onAwarenessUpdate
    this.onStatusChange = onStatusChange
    this.onSyncMessage = onSyncMessage

    // Whether to connect to other peers or not
    this.shouldConnect = connect

    this._resyncInterval = resyncInterval

    if (resyncInterval > 0) {
      this._resyncInterval = setInterval(() => {
        if (this.socket && this.socket.connected) {
          // resend sync step 1
          const encoder = encoding.createEncoder()
          encoding.writeVarUint(encoder, messageSync)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          syncProtocol.writeSyncStep1(encoder, this.doc)
          this.socket.send(encoding.toUint8Array(encoder))
        }
      }, resyncInterval)
    }

    this._bcSubscriber = (data: ArrayBuffer, origin) => {
      if (origin !== this) {
        const encoder = this.readMessage(new Uint8Array(data), true)
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder), this)
        }
      }
    }

    // Listens to Yjs updates and sends them to remote peers (socket and broadcastchannel)
    this._updateHandler = (update: Uint8Array, origin) => {
      console.log('_updateHandler', origin)
      if (origin !== this) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        this.broadcastMessage(encoding.toUint8Array(encoder))
      }
    }

    this.doc.on('update', this._updateHandler)

    this._awarenessUpdateHandler = ({ added, updated, removed }, origin) =>
      //origin: any old param that was not used, rember it for future reference
      {
        const changedClients = added.concat(updated).concat(removed)
        const encoder = encoding.createEncoder()

        encoding.writeVarUint(encoder, messageAwareness)
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
        )

        this.broadcastMessage(encoding.toUint8Array(encoder))
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
        this.socketConnected &&
        messageReconnectTimeout <
          time.getUnixTime() - this.socketLastMessageReceived
      ) {
        console.log(
          'no message received in a long time - not even your own awareness'
        )
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        this.socket?.disconnect()
      }
    }, messageReconnectTimeout / 10)

    if (connect) {
      this.connect()
    }
  }

  syncAgain() {
    if (this.socket && this.socket.connected) {
      // resend sync step 1
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSync)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      syncProtocol.writeSyncStep1(encoder, this.doc)
      this.socket.send(encoding.toUint8Array(encoder))
    }
  }

  setupSocket() {
    if (this.shouldConnect && this.socket === null) {
      this.socket = io(this.url, {
        query: {
          scopeId: this.scopeId,
          bearer: this.rawBearer,
        },
        path:
          process.env.NODE_ENV === 'development'
            ? '/socket-io'
            : '/api/entity-engine',
      })

      //this.socket.binaryType = 'arraybuffer'
      this.socketConnecting = true
      this.socketConnected = false
      this.synced = false

      this.socket.on('connect', () => {
        this.socketConnecting = false
        this.socketConnected = true
      })

      this.socket.on('message', (data) => {
        this.socketLastMessageReceived = time.getUnixTime()
        const encoder = this.readMessage(new Uint8Array(data), true)

        //console.log('we got message')

        if (encoding.length(encoder) > 1) {
          //console.log('greater 1', encoding.length(encoder))
          this.socket?.send(encoding.toUint8Array(encoder))
        }
      })

      this.socket.on('error', (error) => {
        console.log('setupSocket: websocket error', error)
        this.emit('connection-error', [error, this])
      })

      this.socket.on('disconnect', (error) => {
        this.emit('connection-close', [error, this])
        this.socket = null
        this.socketConnecting = false

        if (this.socketConnected) {
          this.socketConnected = false
          this.synced = false
          // update awareness (all users except local left)
          awarenessProtocol.removeAwarenessStates(
            this.awareness,
            Array.from(this.awareness.getStates().keys()).filter(
              (client) => client !== this.doc.clientID
            ),
            this
          )
          this.onStatusChange?.('disconnected')
        } else {
          this.socketUnsuccessfulReconnects++
        }

        // Start with no reconnect timeout and increase timeout by
        // using exponential backoff starting with 100ms
        console.log('reconnect exp')
        setTimeout(
          this.setupSocket,
          math.min(
            math.pow(2, this.socketUnsuccessfulReconnects) * 100,
            this.maxBackoffTime
          ),
          this
        )
      })

      //websocket.onopen = () => {
      //  console.log('setupSocket: opened')
      //}

      this.socket.on('connect', () => {
        //console.log('setupSocket: socket opened')

        this.socketLastMessageReceived = time.getUnixTime()
        this.socketConnecting = false
        this.socketConnected = true
        this.socketUnsuccessfulReconnects = 0

        this.onStatusChange?.('connected')

        // always send sync step 1 when connected
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        syncProtocol.writeSyncStep1(encoder, this.doc)
        this.socket?.send(encoding.toUint8Array(encoder))

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
          this.socket?.send(encoding.toUint8Array(encoderAwarenessState))
        }
      })
      this.onStatusChange?.('connecting')
    }
  }

  get synced() {
    return this._synced
  }

  set synced(state) {
    console.log('Setting synced to ' + state)
    if (this._synced !== state) {
      this._synced = state
      this.emit('synced', [state])
      this.emit('sync', [state])
    }
  }

  destroy() {
    if (this._resyncInterval !== 0) {
      this.socket?.emit('forceDisconnect')
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
    if (this.disableBc) {
      return
    }

    if (!this.bcConnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber)
      this.bcConnected = true
    }

    // send sync step1 to bc
    // write sync step 1
    const encoderSync = encoding.createEncoder()
    encoding.writeVarUint(encoderSync, messageSync)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

    this.broadcastMessage(encoding.toUint8Array(encoder))

    if (this.bcConnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber)
      this.bcConnected = false
    }
  }

  disconnect() {
    console.log('disconnect socket', this.socket)
    this.shouldConnect = false
    this.disconnectBc()
    if (this.socket !== null) {
      this.socket.disconnect()
    }
  }

  connect() {
    console.log('connecting to', this.url)
    this.shouldConnect = true
    if (!this.socketConnected && this.socket === null) {
      this.setupSocket()
      this.connectBc()
    }
  }

  readMessage(buf: Uint8Array, emitSynced: boolean): encoding.Encoder {
    const decoder = decoding.createDecoder(buf)

    const encoder = encoding.createEncoder()
    const messageType = decoding.readVarUint(decoder)
    //console.log('message type', messageType)

    //console.log('readMessage', buf, 'message type', messageType)
    const messageHandler = this.messageHandlers[messageType]

    if (messageHandler) {
      messageHandler(encoder, decoder, this, emitSynced, messageType)
    } else {
      console.error('Unable to compute message')
    }

    return encoder
  }

  broadcastMessage(buf: ArrayBuffer) {
    if (this.socketConnected && this.socket !== null) {
      this.socket.send(buf)
    }
    if (this.bcConnected) {
      bc.publish(this.bcChannel, buf, this)
    }
  }

  permissionDeniedHandler(reason: string) {
    console.warn(`Permission denied to access ${this.url}.\n${reason}`)
  }
}
