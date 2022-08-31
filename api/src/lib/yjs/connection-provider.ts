import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as map from 'lib0/map'
import * as mutex from 'lib0/mutex'
import { Socket } from 'socket.io'
import { Scope } from 'types/graphql'
import * as awarenessProtocol from 'y-protocols/awareness'

import { checkValue } from 'src/config'

import * as syncProtocol from './sync'
import { RedisPersistence } from './y-redis'

import { Y } from './index'

const eeRedisUsername = checkValue<string>('entity-engine.redis.userName')
const eeRedisPassword = checkValue<string>('entity-engine.redis.password')
const eeRedisHost = checkValue<string>('entity-engine.redis.host')
const eeRedisPort = checkValue<number>('entity-engine.redis.port')

export const persistenceProvider = new RedisPersistence({
  redisOpts: {
    port: eeRedisPort,
    host: eeRedisHost,
    username: eeRedisUsername,
    password: eeRedisPassword,
  },
})

export const getOpenDoc = (scope: Scope): OpenDoc => {
  const docName = `${scope.variant}:${scope.variantTargetId}`

  return map.setIfUndefined(openDocs, docName, () => {
    console.log('Creating new doc', docName)
    const doc = new OpenDoc(scope)

    persistenceProvider.bindState(docName, doc)

    openDocs.set(docName, doc)
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
    this.scope = scope
    this.mux = mutex.createMutex()
    this.sockets = new Map()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    this.guid = `${scope.variant}:${scope.variantTargetId}`

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
  }

  // Removes a connection from a doc
  async closeSocket(socket: Socket) {
    console.log(
      'Removing',
      socket.id,
      'from synced doc',
      this.guid,
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
        persistenceProvider.closeDoc(this.guid)
        openDocs.delete(this.guid)
        console.log('Closed doc', this.guid)
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
