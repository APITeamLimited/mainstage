/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApolloClient } from '@apollo/client'
import * as bc from 'lib0/broadcastchannel'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as math from 'lib0/math'
import { Observable } from 'lib0/observable'
import { uuidv4 } from 'lib0/random'
import * as time from 'lib0/time'
import { io, protocol, Socket } from 'socket.io-client'
import type { Awareness } from 'y-protocols/awareness'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { Lib0Module, YJSModule } from 'src/contexts/imports'

import * as syncProtocol from './sync'
import { GET_PUBLIC_BEARER, PossibleSyncStatus } from './utils'

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
    // Get current domain
    const domain = window.location.hostname
    return `https://${domain}`
  }
}

// todo: This should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000

const messageSync = 0
const messageAwareness = 1
const messageQueryAwareness = 3

type MessageHandlersType = Array<
  (
    arg0: encoding.Encoder,
    arg1: decoding.Decoder,
    arg2: SocketIOProvider,
    arg3: boolean,
    arg4: number
  ) => void
>

type SocketIOProviderConstructorArgs = {
  scopeId: string
  rawBearer: string
  doc: YDoc
  options?: {
    connect?: boolean
    // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
    awareness?: Awareness
    resyncInterval?: number
    // Specify the maximum amount to wait between reconnects (we use exponential backoff).
    maxBackoffTime?: number
    disableBc?: boolean
    onAwarenessUpdate?: (awareness: Awareness) => void
    onStatusChange?: ((status: PossibleSyncStatus) => void) | undefined
    onSyncMessage?: ((newDoc: YDoc) => void) | undefined
  }
  apolloClient: ApolloClient<unknown>
  Y: YJSModule
  lib0: Lib0Module
}

export class SocketIOProvider extends Observable<string> {
  updateAwarenessInterval
  apolloClient: ApolloClient<unknown>
  maxBackoffTime: number
  bcChannel: string
  url: string
  scopeId: string
  rawBearer: string
  doc: YDoc
  awareness: Awareness
  socketConnecting: boolean
  socketConnected: boolean
  disableBc: boolean
  socketUnsuccessfulReconnects: number
  messageHandlers: MessageHandlersType
  _synced: boolean
  socket: Socket | null
  socketLastMessageReceived: number
  shouldConnect: boolean
  lastPinged: number
  _resyncInterval
  _bcSubscriber: (data: ArrayBuffer, origin: any) => void
  _updateHandler: (update: Uint8Array, origin: any) => void
  _awarenessUpdateHandler: (
    { added, updated, removed }: any,
    origin: any
  ) => void
  _beforeUnloadHandler: () => void
  _checkInterval
  onAwarenessUpdate: ((awareness: Awareness) => void) | undefined
  onStatusChange: ((status: PossibleSyncStatus) => void) | undefined
  onSyncMessage: ((newDoc: YDoc) => void) | undefined
  Y: YJSModule

  constructor({
    scopeId,
    rawBearer,
    doc,
    options,
    apolloClient,
    Y,
  }: SocketIOProviderConstructorArgs) {
    const {
      connect = true,
      awareness = new Y.awarenessProtocol.Awareness(doc),
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
    this.disableBc = disableBc
    this.socketUnsuccessfulReconnects = 0
    this._synced = false
    this.socket = null
    this.lastPinged = new Date().getTime()
    this.apolloClient = apolloClient
    this.socketLastMessageReceived = 0
    this.onAwarenessUpdate = onAwarenessUpdate
    this.onStatusChange = onStatusChange
    this.onSyncMessage = onSyncMessage
    this.updateAwarenessInterval = setInterval(
      async () => this.getAndSetPublicBearer(),
      20000
    )
    this.Y = Y

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
          syncProtocol.writeSyncStep1(encoder, this.doc, this.Y)
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
          this.Y.awarenessProtocol.encodeAwarenessUpdate(
            awareness,
            changedClients
          )
        )

        this.broadcastMessage(encoding.toUint8Array(encoder))
      }

    this._beforeUnloadHandler = () => {
      this.Y.awarenessProtocol.removeAwarenessStates(
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
        this.disconnect()
        this.connect()
      }
    }, messageReconnectTimeout / 10)

    this.messageHandlers = []

    this.messageHandlers[messageSync] = (
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
        provider,
        Y
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

    this.messageHandlers[messageQueryAwareness] = (
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
        this.Y.awarenessProtocol.encodeAwarenessUpdate(
          provider.awareness,
          Array.from(provider.awareness.getStates().keys())
        )
      )
    }

    this.messageHandlers[messageAwareness] = (
      encoder,
      decoder,
      provider,
      emitSynced,
      messageType
    ) => {
      this.Y.awarenessProtocol.applyAwarenessUpdate(
        provider.awareness,
        decoding.readVarUint8Array(decoder),
        provider
      )
      //console.log('messageAwareness handler')
      provider.onAwarenessUpdate?.(provider.awareness)
    }

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
      syncProtocol.writeSyncStep1(encoder, this.doc, this.Y)
      this.socket.send(encoding.toUint8Array(encoder))
    }
  }

  setupSocket(orderReconnect = false) {
    if (orderReconnect) {
      this.shouldConnect = false
    }

    if (this.shouldConnect && this.socket === null) {
      this.socket = io(this.url, {
        query: {
          scopeId: this.scopeId,
          bearer: this.rawBearer,
        },
        path: '/api/entity-engine',
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
          this.Y.awarenessProtocol.removeAwarenessStates(
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
        setTimeout(
          () => this.setupSocket(true),
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
        syncProtocol.writeSyncStep1(encoder, this.doc, this.Y)
        this.socket?.send(encoding.toUint8Array(encoder))

        // broadcast local awareness state
        if (this.awareness.getLocalState() !== null) {
          const encoderAwarenessState = encoding.createEncoder()
          encoding.writeVarUint(encoderAwarenessState, messageAwareness)
          encoding.writeVarUint8Array(
            encoderAwarenessState,
            this.Y.awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
              this.doc.clientID,
            ])
          )
          this.socket?.send(encoding.toUint8Array(encoderAwarenessState))
        }

        this.getAndSetPublicBearer()
      })
      this.onStatusChange?.('connecting')
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
    this.shouldConnect = false
    this.awareness.setLocalState(null)

    if (this._resyncInterval !== 0) {
      this.socket?.emit('forceDisconnect')
      clearInterval(this._resyncInterval)
    }
    clearInterval(this._checkInterval)

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler)
    } else if (typeof process !== 'undefined') {
      process.off('exit', this._beforeUnloadHandler)
    }

    this.awareness.off('update', this._awarenessUpdateHandler)
    this.doc.off('update', this._updateHandler)
    super.destroy()
  }

  disconnect() {
    this.socket?.emit('forceDisconnect')
    this.socket?.disconnect()
    this.destroy()
  }

  connect() {
    this.shouldConnect = true
    if (!this.socketConnected && this.socket === null) {
      this.setupSocket()
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
  }

  permissionDeniedHandler(reason: string) {
    console.warn(`Permission denied to access ${this.url}.\n${reason}`)
  }

  // Provides a way to connect clientID to userId
  async getAndSetPublicBearer() {
    if (!this.socketConnected) return

    const result = await this.apolloClient.query({
      query: GET_PUBLIC_BEARER,
      variables: { clientID: this.awareness.clientID, scopeId: this.scopeId },
      // Prevent using same token twice
      fetchPolicy: 'network-only',
    })

    if (!result.data?.publicBearer) {
      throw new Error('Public bearer token not found')
    }

    //console.log('aww', this.awareness.getStates())

    this.awareness.setLocalStateField('publicBearer', result.data.publicBearer)
  }
}
