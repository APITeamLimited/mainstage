import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as map from 'lib0/map'
import * as mutex from 'lib0/mutex'
import { Socket } from 'socket.io'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import { Scope } from '../../../api/types/graphql'
import { checkValue } from '../config'
import { populateOpenDoc } from '../entities'

import * as syncProtocol from './sync'
import { handlePostAuth } from './utils'
import { RedisPersistence } from './y-redis'

const eeRedisUsername = checkValue<string>('entity-engine.redis.userName')
const eeRedisPassword = checkValue<string>('entity-engine.redis.password')
const eeRedisHost = checkValue<string>('entity-engine.redis.host')
const eeRedisPort = checkValue<number>('entity-engine.redis.port')

const persistenceProvider = new RedisPersistence({
  redisOpts: {
    port: eeRedisPort,
    host: eeRedisHost,
    username: eeRedisUsername,
    password: eeRedisPassword,
  },
})

export const handleNewConnection = async (socket: Socket) => {
  const postAuth = await handlePostAuth(socket)

  if (postAuth === null) return

  const { scope /*, jwt*/ } = postAuth

  const doc = getOpenDoc(scope)
  doc.sockets.set(socket, new Set())

  socket.on('message', (message: ArrayBuffer) =>
    doc.messageListener(socket, new Uint8Array(message))
  )

  // On disconnect remove the connection from the doc
  socket.on('disconnect', () => {
    doc.closeSocket(socket)
  })

  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSyncType)

    syncProtocol.writeSyncStep1(encoder, doc)
    //console.log(encoder, doc.getMap('projects').size)
    doc.send(socket, encoding.toUint8Array(encoder))

    const awarenessStates = doc.awareness.getStates()

    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()

      encoding.writeVarUint(encoder, messageAwarenessType)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      )

      doc.send(socket, encoding.toUint8Array(encoder))
    }
  }
}

export const getOpenDoc = (scope: Scope): OpenDoc => {
  return map.setIfUndefined(openDocs, scope.id, () => {
    console.log('Creating new doc', scope.id)
    const doc = new OpenDoc(scope)

    // Connect with persistence provider
    // TODO: Figure out why throwing error when still works
    try {
      persistenceProvider.bindState(scope.id, doc)
    } catch (e) {
      console.log(e)
    }

    openDocs.set(scope.id, doc)
    return doc
  })
}

const openDocs = new Map<string, OpenDoc>()

const messageSyncType = 0
const messageAwarenessType = 1

class OpenDoc extends Y.Doc {
  scope: Scope
  mux: mutex.mutex
  sockets: Map<Socket, Set<number>>
  awareness: awarenessProtocol.Awareness

  constructor(scope: Scope) {
    super()

    // TODO: add logic with persistence provider to load state and
    // populate the doc with the state only when not already populated
    populateOpenDoc(this, {
      type: 'PRO',
      remote: true,
      isTeam: false,
    })
    this.scope = scope
    this.mux = mutex.createMutex()
    this.sockets = new Map()
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    this.guid = scope.id

    this.awareness.on(
      'update',
      (
        {
          added,
          updated,
          removed,
        }: {
          added: Array<number>
          updated: Array<number>
          removed: Array<number>
        },
        connectionWithChange: Socket | null
      ) => {
        //console.log('awareness update', added, updated, removed)
        const changedClients = added.concat(updated, removed)

        if (connectionWithChange !== null) {
          const connControlledIDs = this.sockets.get(connectionWithChange)
          if (connControlledIDs !== undefined) {
            added.forEach((clientID) => {
              connControlledIDs.add(clientID)
            })
            removed.forEach((clientID) => {
              connControlledIDs.delete(clientID)
            })
          }
        }

        // broadcast awareness update
        const encoder = encoding.createEncoder()

        encoding.writeVarUint(encoder, messageAwarenessType)
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(
            this.awareness,
            changedClients
          )
        )

        const buff = encoding.toUint8Array(encoder)

        this.sockets.forEach((_, c) => {
          this.send(c, buff)
        })
      }
    )

    this.on('update', async (update: Uint8Array) => {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSyncType)

      syncProtocol.writeUpdate(encoder, update)
      const message = encoding.toUint8Array(encoder)

      //persistenceProvider?.writeState(this.scope.id, this)

      this.sockets.forEach((_, socket) => this.send(socket, message))
    })
  }

  send(socket: Socket, m: Uint8Array) {
    if (!socket.connected) {
      this.closeSocket(socket)
    }
    try {
      socket.send(m, (err: null) => {
        err != null && this.closeSocket(socket)
      })
    } catch (e) {
      console.log('failed to send message from OpenDoc', e)
      this.closeSocket(socket)
    }

    //persistenceProvider.writeState(this.scope.id, this)
  }

  // Removes a connection from a doc
  async closeSocket(socket: Socket) {
    console.log(
      'Removing',
      socket.id,
      'from synced doc',
      this.scope.id,
      this.sockets.size - 1
    )

    if (this.sockets.has(socket)) {
      const controlledIds: Set<number> = this.sockets.get(socket) || new Set()
      this.sockets.delete(socket)

      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      )
      if (this.sockets.size === 0) {
        //await persistenceProvider.writeState(this.scope.id, this)
        persistenceProvider.closeDoc(this.scope.id)
        openDocs.delete(this.scope.id)
        console.log('Closed doc', this.scope.id)
      }
    }

    socket.disconnect()
  }

  messageListener(socket: Socket, message: Uint8Array) {
    try {
      const encoder = encoding.createEncoder()
      const decoder = decoding.createDecoder(message)
      const messageType = decoding.readVarUint(decoder)

      //console.log('message type', messageType)

      switch (messageType) {
        case messageSyncType:
          encoding.writeVarUint(encoder, messageSyncType)
          syncProtocol.readSyncMessage(decoder, encoder, this, null)

          if (encoding.length(encoder) > 1) {
            //this.send(socket, encoding.toUint8Array(encoder))

            this.send(socket, encoding.toUint8Array(encoder))
          }
          break
        case messageAwarenessType: {
          awarenessProtocol.applyAwarenessUpdate(
            this.awareness,
            decoding.readVarUint8Array(decoder),
            socket
          )
          break
        }
      }
    } catch (err) {
      console.error(err)
      this.emit('error', [err])
    }
  }
}
