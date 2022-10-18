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
  updateAwarenessInterval: unknown
  apolloClient: ApolloClient<unknown>
  maxBackoffTime: number
  bcChannel: string
  url: string
  scopeId: string
  rawBearer: string
  doc: YDoc
  awareness: Awareness | null
  socketConnecting: boolean
  socketConnected: boolean
  disableBc: boolean
  socketUnsuccessfulReconnects: number
  messageHandlers: MessageHandlersType
  _synced: boolean
  socket: Socket | null
  socketLastMessageReceived: number
  connectHelper: unknown
  shouldConnect: boolean
  lastPinged: number
  _resyncInterval
  _updateHandler: (update: Uint8Array, origin: unknown) => void
  _awarenessUpdateHandler:
    | ((
        {
          added,
          updated,
          removed,
        }: {
          added: Array<number>
          updated: Array<number>
          removed: Array<number>
        },
        origin: unknown
      ) => void)
    | undefined
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
      awareness = null,
      resyncInterval = -1,
      maxBackoffTime = 100,
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
    this.Y = Y

    // Whether to connect to other peers or not
    this.shouldConnect = connect

    this.connectHelper = setInterval(() => {
      if (!this.socketConnected && window.navigator.onLine) {
        this.setupSocket()
      }
    }, 1000)

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

    this._beforeUnloadHandler = () => {
      if (this.awareness) {
        this.Y.awarenessProtocol.removeAwarenessStates(
          this.awareness,
          [doc.clientID],
          'window unload'
        )
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._beforeUnloadHandler)
    } else if (typeof process !== 'undefined') {
      process.on('exit', this._beforeUnloadHandler)
    }

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

      if (
        emitSynced &&
        syncMessageType === syncProtocol.messageYjsSyncStep2 &&
        !provider.synced
      ) {
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
      if (provider.awareness) {
        encoding.writeVarUint(encoder, messageAwareness)
        encoding.writeVarUint8Array(
          encoder,
          this.Y.awarenessProtocol.encodeAwarenessUpdate(
            provider.awareness,
            Array.from(provider.awareness.getStates().keys())
          )
        )
      }
    }

    this.messageHandlers[messageAwareness] = (
      encoder,
      decoder,
      provider,
      emitSynced,
      messageType
    ) => {
      if (provider.awareness) {
        this.Y.awarenessProtocol.applyAwarenessUpdate(
          provider.awareness,
          decoding.readVarUint8Array(decoder),
          provider
        )
        provider.onAwarenessUpdate?.(provider.awareness)
      }
    }

    if (connect) {
      this.connect()
    }
  }

  setupSocket() {
    const handleSetup = async () => {
      let newSocket = null as null | Socket

      newSocket = io(this.url, {
        query: {
          scopeId: this.scopeId,
          bearer: this.rawBearer,
        },
        path: '/api/entity-engine',
        reconnection: false,
      })

      this.socketConnecting = true
      this.socketConnected = false
      this.synced = false

      newSocket.on('connect', () => {
        this.socketConnecting = false
        this.socketConnected = true
      })

      newSocket.on('message', (data) => {
        this.socketLastMessageReceived = time.getUnixTime()
        const encoder = this.readMessage(new Uint8Array(data), true)

        if (encoding.length(encoder) > 1) {
          this.socket?.send(encoding.toUint8Array(encoder))
        }
      })

      newSocket.on('error', (error) => {
        console.log('setupSocket: websocket error', error)
        this.emit('connection-error', [error, this])
      })

      newSocket.on('connect_error', async () => {
        this.socketUnsuccessfulReconnects++

        newSocket?.close()
      })

      newSocket.on('disconnect', async (error) => {
        this.emit('connection-close', [error, this])
        this.socket = null
        this.socketConnecting = false

        if (this.socketConnected) {
          this.socketConnected = false
          this.synced = false
          this.onStatusChange?.('disconnected')
        } else {
          this.socketUnsuccessfulReconnects++
        }

        newSocket?.close()
      })

      newSocket.on('connect', () => {
        this.socket = newSocket

        const newAwareness = new this.Y.awarenessProtocol.Awareness(this.doc)
        newAwareness.setLocalState({})

        this._awarenessUpdateHandler = ({ added, updated, removed }) => {
          const changedClients = added.concat(updated).concat(removed)
          const encoder = encoding.createEncoder()

          encoding.writeVarUint(encoder, messageAwareness)
          encoding.writeVarUint8Array(
            encoder,
            this.Y.awarenessProtocol.encodeAwarenessUpdate(
              newAwareness as Awareness,
              changedClients
            )
          )

          this.broadcastMessage(encoding.toUint8Array(encoder))
        }

        newAwareness.on('update', this._awarenessUpdateHandler)

        this.awareness = newAwareness

        this.awareness?.setLocalState({})
        this.getAndSetPublicBearer()

        this.updateAwarenessInterval = setInterval(
          async () => this.getAndSetPublicBearer(),
          2000
        )

        this.socketLastMessageReceived = time.getUnixTime()
        this.socketConnecting = false
        this.socketConnected = true
        this.socketUnsuccessfulReconnects = 0

        // always send sync step 1 when connected
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        syncProtocol.writeSyncStep1(encoder, this.doc, this.Y)
        this.socket?.send(encoding.toUint8Array(encoder))

        // broadcast local awareness state
        if (this.awareness) {
          const encoderAwarenessState = encoding.createEncoder()
          encoding.writeVarUint(encoderAwarenessState, messageAwareness)
          encoding.writeVarUint8Array(
            encoderAwarenessState,
            this.Y.awarenessProtocol.encodeAwarenessUpdate(newAwareness, [
              this.doc.clientID,
            ])
          )
          this.socket?.send(encoding.toUint8Array(encoderAwarenessState))
        }
      })

      newSocket.on('synced', () => this.onStatusChange?.('connected'))

      this.onStatusChange?.('connecting')
    }

    handleSetup()
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
    this.awareness?.setLocalState(null)

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

    if (this._awarenessUpdateHandler) {
      this.awareness?.off('update', this._awarenessUpdateHandler)
    }

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

  // Provides a way to connect clientID to userId
  async getAndSetPublicBearer() {
    if (!this.socketConnected) return

    const result = await this.apolloClient.query({
      query: GET_PUBLIC_BEARER,
      variables: { clientID: this.awareness?.clientID, scopeId: this.scopeId },
      // Prevent using same token twice
      fetchPolicy: 'network-only',
    })

    if (!result.data?.publicBearer) {
      throw new Error('Public bearer token not found')
    }

    this.awareness?.setLocalStateField('publicBearer', result.data.publicBearer)
  }
}
