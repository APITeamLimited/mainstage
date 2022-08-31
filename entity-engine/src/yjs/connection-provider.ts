import { Team, Membership, User } from '@prisma/client'
import * as JWT from 'jsonwebtoken'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as map from 'lib0/map'
import * as mutex from 'lib0/mutex'
import { Socket } from 'socket.io'
import {
  DecodedPublicBearer,
  MemberAwareness,
  ServerAwareness,
} from 'types/src'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import { Scope } from '../../../api/types/graphql'
import { checkValue } from '../config'
import { populateOpenDoc } from '../entities'
import { coreCacheReadRedis } from '../redis'
import { getAndSetAPIPublicKey } from '../services'

import * as syncProtocol from './sync'
import { handlePostAuth } from './utils'
import { RedisPersistence } from './y-redis'

const eeRedisUsername = checkValue<string>('entity-engine.redis.userName')
const eeRedisPassword = checkValue<string>('entity-engine.redis.password')
const eeRedisHost = checkValue<string>('entity-engine.redis.host')
const eeRedisPort = checkValue<number>('entity-engine.redis.port')

const publicAudience = `${checkValue<string>('api.bearer.audience')}-public`
const issuer = checkValue<string>('api.bearer.issuer')

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
  const { scope } = postAuth

  const doc = getOpenDoc(scope)
  doc.sockets.set(socket, new Set())
  doc.scopes.set(socket, new Set())
  const scopeSet = doc.scopes.get(socket)

  if (!scopeSet) {
    socket.disconnect()
    doc.sockets.delete(socket)
    doc.scopes.delete(socket)
    console.warn('Could not find scope set for socket')
    return
  }

  scopeSet.add(scope)

  socket.on('message', (message: ArrayBuffer) =>
    doc.messageListener(socket, new Uint8Array(message))
  )

  socket.on('forceDisconnect', () => doc.closeSocket(socket))

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
  mux: mutex.mutex
  sockets: Map<Socket, Set<number>>
  scopes: Map<Socket, Set<Scope>>
  awareness: awarenessProtocol.Awareness
  variant: string
  variantTargetId: string
  lastVerifiedClients: Map<number, number>

  constructor(scope: Scope) {
    super()

    // TODO: add logic with persistence provider to load state and
    // populate the doc with the state only when not already populated
    populateOpenDoc(this)
    this.mux = mutex.createMutex()
    this.scopes = new Map()
    this.sockets = new Map()
    this.lastVerifiedClients = new Map()
    this.awareness = new awarenessProtocol.Awareness(this)
    // TODO: make this a configurable value with user info and roles etc.
    this.awareness.setLocalState({
      teamInfo: {},
    })
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

          if (!connControlledIDs) {
            connectionWithChange?.disconnect?.()
            return
          }

          added.forEach((clientID) => {
            // Verify the publicBearer of the client

            //console.log('Added id', clientID)

            connControlledIDs.add(clientID)
            this.verifyAwareness(connectionWithChange, clientID)
          })

          updated.forEach((clientID) => {
            this.verifyAwareness(connectionWithChange, clientID, true)
          })

          removed.forEach((clientID) => {
            connControlledIDs.delete(clientID)
          })
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

    this.variant = scope.variant
    this.variantTargetId = scope.variantTargetId

    this.connectAwareness()

    setInterval(() => this.discardUnawareClients(), 5000)
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

    this.scopes.delete(socket)

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

  async disconnectClient(clientID: number) {
    const socket = this.getSocketFromClientID(clientID)
    if (!socket) {
      // If no socket is found, the client is not connected to the doc
      this.lastVerifiedClients.delete(clientID)
      return
    }
    await this.closeSocket(socket)
    this.lastVerifiedClients.delete(clientID)
  }

  getSocketFromClientID(clientID: number) {
    // Search sockets map for the clientID
    for (const [socket, controlledIDs] of this.sockets) {
      if (controlledIDs.has(clientID)) {
        return socket
      }
    }
    return null
  }

  async connectAwareness() {
    if (this.variant === 'TEAM') {
      const allTeamInfoRaw = await coreCacheReadRedis.hGetAll(
        `team:${this.variantTargetId}`
      )

      const team = JSON.parse(allTeamInfoRaw.team) as Team
      const memberships = [] as Membership[]

      Object.entries(allTeamInfoRaw).map(([key, value]) => {
        if (key.startsWith('membership:')) {
          memberships.push(JSON.parse(value) as Membership)
        }
      })

      const usersRaw = await coreCacheReadRedis.mGet(
        memberships.map((m) => `user:${m.userId}`)
      )
      const users = usersRaw.map((u) => JSON.parse(u || '') as User)

      const lastOnlineTimes = [] as {
        userId: string
        lastOnline: Date
      }[]

      Object.entries(allTeamInfoRaw).map(([key, value]) => {
        if (key.startsWith('lastOnlineTime:')) {
          lastOnlineTimes.push({
            userId: key.split(':')[1],
            lastOnline: new Date(parseInt(value)),
          })
        }
      })

      const members = memberships.map((m) => {
        const user = users.find((u) => u.id === m.userId)
        if (!user) {
          throw new Error(
            `Could not find user ${m.userId} for membership ${m.id} cannot create server awareness`
          )
        }

        return {
          userId: m.userId,
          displayName: `${user.firstName} ${user.lastName}`,
          role: m.role,
          profilePicture: user.profilePicture,
          joinedTeam: m.createdAt,
          lastOnline:
            lastOnlineTimes.find((l) => l.userId === m.userId)?.lastOnline ||
            null,
        } as MemberAwareness
      })

      const initialAwareness: ServerAwareness = {
        variantTargetId: this.variantTargetId,
        variant: this.variant,
        team,
        members,
      }

      this.awareness.setLocalState(initialAwareness)
    } else if (this.variant === 'USER') {
      const initialAwareness: ServerAwareness = {
        variantTargetId: this.variantTargetId,
        variant: this.variant,
      }

      this.awareness.setLocalState(initialAwareness)
    } else {
      throw new Error(`Unknown variant ${this.variant}`)
    }

    console.log(this.awareness.getLocalState())
  }

  // Verify tokens of all clients and boot them if they are invalid, if they are valid,
  // their awareness is
  async verifyAwareness(socket: Socket, clientID: number, finalChance = false) {
    if (clientID === this.awareness.clientID) return

    const awareness = this.awareness.getStates().get(clientID)
    if (!awareness) return

    // Verify the publicBearer of the client
    if (awareness.publicBearer) {
      try {
        const decodedToken = JWT.verify(
          awareness.publicBearer,
          await getAndSetAPIPublicKey(),
          {
            audience: publicAudience,
            issuer,
            complete: true,
          }
        ) as DecodedPublicBearer

        if (decodedToken.payload.clientID !== clientID) {
          this.disconnectClient(clientID)
          return
        }

        const hasScopeId =
          (Array.from(this.scopes.get(socket) || new Set()) as Scope[]).find(
            (s) => s.id === decodedToken.payload.scopeId
          ) !== undefined
            ? true
            : false
        if (!hasScopeId) {
          this.disconnectClient(clientID)
          return
        }

        // Successfully verified the token
        this.lastVerifiedClients.set(clientID, new Date().getTime())
        await this.updateServerAwareness(decodedToken)
        return
      } catch (e) {
        console.warn(
          `Failed to verify token for client ${clientID} an error occurred`,
          e
        )
        this.disconnectClient(clientID)
      }
    }

    if (finalChance) {
      this.disconnectClient(clientID)
      return
    }

    // Get client awareness again
    setTimeout(
      async () => await this.verifyAwareness(socket, clientID, true),
      5000
    )
  }

  /*
  If a client isn't updating its awareness in time, disconnect them
  */
  discardUnawareClients() {
    const currentTime = new Date().getTime()

    for (const [clientID, lastVerified] of this.lastVerifiedClients) {
      if (currentTime - lastVerified > 30000) {
        this.disconnectClient(clientID)
      }
    }
  }

  async updateServerAwareness(decodedToken: DecodedPublicBearer) {
    // Update last online time for the user
    const serverAwareness = this.awareness.getLocalState() as ServerAwareness

    if (serverAwareness.variant === 'TEAM') {
      const member = serverAwareness.members.find(
        (m) => m.userId === decodedToken.payload.userId
      )

      if (!member) {
        throw new Error(
          `Could not find member ${decodedToken.payload.userId} in team ${this.variantTargetId}`
        )
      }

      member.lastOnline = new Date()
      member.displayName = decodedToken.payload.displayName
      member.profilePicture = decodedToken.payload.profilePicture
      member.role = decodedToken.payload.role

      await coreCacheReadRedis.hSet(
        `team:${this.variantTargetId}`,
        `lastOnlineTime:${decodedToken.payload.userId}`,
        member.lastOnline.getTime()
      )

      const newServerAwareness: ServerAwareness = {
        ...serverAwareness,
        members: [...serverAwareness.members, member],
      }

      this.awareness.setLocalState(newServerAwareness)
    }
  }
}
