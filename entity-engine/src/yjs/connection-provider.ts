import {
  DecodedPublicBearer,
  getDisplayName,
  RedisTeamPublishMessage,
  SafeUser,
  ServerAwareness,
  TeamRole,
} from '@apiteam/types'
import { Team, Membership } from '@prisma/client'
import { Scope } from '@prisma/client'
import * as JWT from 'jsonwebtoken'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as map from 'lib0/map'
import * as mutex from 'lib0/mutex'
import { Socket } from 'socket.io'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import { checkValue } from '../config'
import { populateOpenDoc } from '../entities'
import { coreCacheReadRedis, coreCacheSubscribeRedis } from '../redis'
import { getAndSetAPIPublicKey } from '../services'

import * as syncProtocol from './sync'
import { createMemberAwareness, handlePostAuth, LastOnlineTime } from './utils'
import { RedisPersistence } from './y-redis'

const eeRedisUsername = checkValue<string>('entity-engine.redis.userName')
const eeRedisPassword = checkValue<string>('entity-engine.redis.password')
const eeRedisHost = checkValue<string>('entity-engine.redis.host')
const eeRedisPort = checkValue<number>('entity-engine.redis.port')

const publicAudience = `${checkValue<string>('api.bearer.audience')}-public`
const issuer = checkValue<string>('api.bearer.issuer')

const bannedAwarenessKeys = ['variantTargetId', 'variant', 'team', 'members']

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

  if (postAuth === null) {
    console.error('Failed to carry out post-auth')
    socket.disconnect()
    return
  }

  const { scope } = postAuth

  const doc = await getOpenDoc(scope)

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

  const serverAwareness = doc.serverAwareness

  if (serverAwareness.variant === 'TEAM') {
    const member = serverAwareness.members.find(
      (member) => member.userId === scope.userId
    )

    if (!member) {
      socket.disconnect()
      doc.sockets.delete(socket)
      doc.scopes.delete(socket)
      console.warn('Could not find member for socket')
      return
    }

    member.lastOnline = new Date()

    const newServerAwareness: ServerAwareness = {
      ...serverAwareness,
      members: serverAwareness.members.map((member) => {
        if (member.userId === scope.userId) {
          return {
            ...member,
            lastOnline: new Date(),
          }
        }

        return member
      }),
    }

    doc.awareness.setLocalState(newServerAwareness)

    const setPromise = coreCacheReadRedis.hSet(
      `team:${doc.variantTargetId}`,
      `lastOnlineTime:${scope.userId}`,
      member.lastOnline.getTime()
    )

    const publishPromise = coreCacheReadRedis.publish(
      `team:${doc.variantTargetId}`,
      JSON.stringify({
        type: 'LAST_ONLINE_TIME',
        payload: {
          userId: scope.userId,
          lastOnline: member.lastOnline,
        },
      } as RedisTeamPublishMessage)
    )

    await Promise.all([setPromise, publishPromise])
  }

  socket.on('message', (message: ArrayBuffer) => {
    doc.messageListener(socket, new Uint8Array(message))
  })

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

export const getOpenDoc = async (scope: Scope): Promise<OpenDoc> => {
  const docName = `${scope.variant}:${scope.variantTargetId}`

  const openDoc = map.setIfUndefined(openDocs, docName, () => {
    const doc = new OpenDoc(scope)

    persistenceProvider.bindState(docName, doc)

    openDocs.set(docName, doc)
    return doc
  })

  if (openDoc.awareness.getLocalState() === null) {
    await openDoc.connectAwareness()
  }
  return openDoc
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
  activeSubscriptions: string[]

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
    this.awareness.setLocalState(null)
    this.guid = `${scope.variant}:${scope.variantTargetId}`
    this.activeSubscriptions = []

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
        const changedClients = added.concat(updated, removed)

        if (connectionWithChange !== null) {
          const connControlledIDs = this.sockets.get(connectionWithChange)

          if (!connControlledIDs) {
            connectionWithChange?.disconnect?.()
            return
          }

          added.forEach((clientID) => {
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
      console.warn('failed to send message from OpenDoc', e)
      this.closeSocket(socket)
    }
  }

  // Removes a connection from a doc
  async closeSocket(socket: Socket) {
    if (this.sockets.has(socket)) {
      const controlledIds: Set<number> = this.sockets.get(socket) || new Set()
      this.sockets.delete(socket)

      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      )
      // Close doc if no more connections
      if (this.sockets.size === 0) {
        const patternSuscriptions = this.activeSubscriptions.filter((pattern) =>
          pattern.endsWith('*')
        )
        const regularSuscriptions = this.activeSubscriptions.filter(
          (pattern) => !pattern.endsWith('*')
        )
        const patternUnsubscribePromise =
          coreCacheSubscribeRedis.pUnsubscribe(patternSuscriptions)
        const regularUnsubscribePromise =
          coreCacheSubscribeRedis.unsubscribe(regularSuscriptions)
        await Promise.all([
          patternUnsubscribePromise,
          regularUnsubscribePromise,
        ])

        persistenceProvider.closeDoc(this.guid)
        openDocs.delete(this.guid)
        super.destroy()
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

      const team = JSON.parse(allTeamInfoRaw.team) as any
      delete team.markedForDeletionExpiresAt
      delete team.markedForDeletionAt
      delete team.markedForDeletionToken
      team as Omit<
        Team,
        | 'markedForDeletion'
        | 'markedForDeletionToken'
        | 'markedForDeletionExpiresAt'
      >
      const memberships = [] as Membership[]

      Object.entries(allTeamInfoRaw).map(([key, value]) => {
        if (key.startsWith('membership:')) {
          memberships.push(JSON.parse(value) as Membership)
        }
      })

      const usersRaw = await coreCacheReadRedis.mGet(
        memberships.map((m) => `user__id:${m.userId}`)
      )

      const users = usersRaw.map((u) => JSON.parse(u || '') as SafeUser)

      const lastOnlineTimes = [] as LastOnlineTime[]

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
        return createMemberAwareness(user, m, lastOnlineTimes)
      })

      const initialAwareness: ServerAwareness = {
        variantTargetId: this.variantTargetId,
        variant: this.variant,
        team,
        members,
      }

      this.awareness.setLocalState(initialAwareness)

      // Subscribe to redis pubsub for team updates
      this.activeSubscriptions.push(`team:${this.variantTargetId}`)
      await coreCacheSubscribeRedis.subscribe(
        `team:${this.variantTargetId}`,
        (message) => {
          console.log('message', message)
          const parsedMessage = JSON.parse(message) as RedisTeamPublishMessage

          if (parsedMessage.type === 'ADD_MEMBER') {
            this.addMember(parsedMessage.payload)
            return
          } else if (parsedMessage.type === 'REMOVE_MEMBER') {
            this.removeMember(parsedMessage.payload)
            return
          } else if (parsedMessage.type === 'CHANGE_ROLE') {
            this.changeRoleMember(parsedMessage.payload)
            return
          } else if (parsedMessage.type === 'LAST_ONLINE_TIME') {
            const serverAwareness =
              this.awareness.getLocalState() as ServerAwareness
            if (serverAwareness.variant !== 'TEAM') return

            const newServerAwareness: ServerAwareness = {
              ...serverAwareness,
              members: serverAwareness.members.map((m) => {
                if (m.userId === parsedMessage.payload.userId) {
                  return {
                    ...m,
                    lastOnline: parsedMessage.payload.lastOnline,
                  }
                }
                return m
              }),
            }

            this.awareness.setLocalState(newServerAwareness)
            return
          }
          console.warn(
            `Unknown message type for message ${message} ignoring...`
          )
        }
      )

      // Subscribe to user updates
      const membershipSubscribePromises = memberships.map((m) => {
        this.activeSubscriptions.push(`user__id:${m.userId}`)
        return coreCacheSubscribeRedis.subscribe(
          `user__id:${m.userId}`,
          (message) => this.updateMemberUser(JSON.parse(message) as SafeUser)
        )
      })
      await Promise.all(membershipSubscribePromises)
    } else if (this.variant === 'USER') {
      const initialAwareness: ServerAwareness = {
        variantTargetId: this.variantTargetId,
        variant: this.variant,
      }

      this.awareness.setLocalState(initialAwareness)
    } else {
      throw new Error(`Unknown variant ${this.variant}`)
    }
  }

  // Verify tokens of all clients and boot them if they are invalid, if they are valid,
  // their awareness is
  async verifyAwareness(socket: Socket, clientID: number, finalChance = false) {
    if (clientID === this.awareness.clientID) return

    const awareness = this.awareness.getStates().get(clientID)
    if (!awareness) return

    // If pretending to be a server, disconnect
    if (bannedAwarenessKeys.some((k) => awareness[k])) {
      this.closeSocket(socket)
      return
    }

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

        const hasScope =
          (Array.from(this.scopes.get(socket) || new Set()) as Scope[]).find(
            (s) => s.id === decodedToken.payload.scopeId
          ) !== undefined
            ? true
            : false
        if (!hasScope) {
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

    this.lastVerifiedClients.forEach((lastVerified, clientID) => {
      if (currentTime - lastVerified > 30000) {
        console.log(
          "Client hasn't updated its awareness in 30 seconds",
          clientID
        )
        this.disconnectClient(clientID)
      }
    })
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

      const setPromise = coreCacheReadRedis.hSet(
        `team:${this.variantTargetId}`,
        `lastOnlineTime:${decodedToken.payload.userId}`,
        member.lastOnline.getTime()
      )

      const publishPromise = coreCacheReadRedis.publish(
        `team:${this.variantTargetId}`,
        JSON.stringify({
          type: 'LAST_ONLINE_TIME',
          payload: {
            userId: decodedToken.payload.userId,
            lastOnline: member.lastOnline,
          },
        } as RedisTeamPublishMessage)
      )

      await Promise.all([setPromise, publishPromise])

      const newServerAwareness: ServerAwareness = {
        ...serverAwareness,
        members: serverAwareness.members.map((m) =>
          m.userId === member.userId ? member : m
        ),
      }

      console.log('648 newServerAwareness', newServerAwareness)
      this.awareness.setLocalState(newServerAwareness)
    }
  }

  get serverAwareness() {
    return this.awareness.getLocalState() as ServerAwareness
  }

  async addMember(member: Membership) {
    const serverAwareness = this.serverAwareness
    if (serverAwareness.variant !== 'TEAM') {
      console.warn(
        `Tried to add member to a ${serverAwareness.variant} doc, ignoring`
      )
      return
    }

    const user = await coreCacheReadRedis.get(`user__id:${member.userId}`)
    if (!user) {
      console.warn(
        `Could not find user ${member.userId} in cache, skipping adding to team ${this.variantTargetId}`
      )
      return
    }

    this.activeSubscriptions.push(`user__id:${member.userId}`)
    coreCacheSubscribeRedis.subscribe(`user__id:${member.userId}`, (message) =>
      this.updateMemberUser(JSON.parse(message) as SafeUser)
    )

    const newServerAwareness: ServerAwareness = {
      ...serverAwareness,
      members: [
        ...serverAwareness.members,
        createMemberAwareness(JSON.parse(user) as SafeUser, member, []),
      ],
    }

    console.log('686 newServerAwareness', newServerAwareness)
    this.awareness.setLocalState(newServerAwareness)
  }

  async removeMember(member: Membership) {
    const serverAwareness = this.serverAwareness
    if (serverAwareness.variant !== 'TEAM') {
      console.warn(
        `Tried to remove member from a ${serverAwareness.variant} doc, ignoring`
      )
      return
    }

    const newServerAwareness: ServerAwareness = {
      ...serverAwareness,
      members: serverAwareness.members.filter(
        (m) => m.userId !== member.userId
      ),
    }

    console.log('707 newServerAwareness', newServerAwareness)
    this.awareness.setLocalState(newServerAwareness)

    this.activeSubscriptions = this.activeSubscriptions.filter(
      (s) => s !== `user__id:${member.userId}`
    )
    await coreCacheSubscribeRedis.unsubscribe(`user__id:${member.userId}`)
  }

  changeRoleMember(member: Membership) {
    const serverAwareness = this.serverAwareness
    if (serverAwareness.variant !== 'TEAM') {
      console.warn(
        `Tried to change role of member from a ${serverAwareness.variant} doc, ignoring`
      )
      return
    }

    const newServerAwareness: ServerAwareness = {
      ...serverAwareness,
      members: serverAwareness.members.map((m) =>
        m.userId === member.userId ? { ...m, role: member.role as TeamRole } : m
      ),
    }

    console.log('732 newServerAwareness', newServerAwareness)
    this.awareness.setLocalState(newServerAwareness)
  }

  updateMemberUser(user: SafeUser) {
    const serverAwareness = this.serverAwareness
    if (serverAwareness.variant !== 'TEAM') {
      console.warn(
        `Tried to update member from a ${serverAwareness.variant} doc, ignoring`
      )
      return
    }

    const newServerAwareness: ServerAwareness = {
      ...serverAwareness,
      members: serverAwareness.members.map((m) =>
        m.userId === user.id
          ? {
              ...m,
              ...{
                displayName: getDisplayName(user),
                profilePicture: user.profilePicture,
              },
            }
          : m
      ),
    }

    console.log('759 newServerAwareness', newServerAwareness)
    this.awareness.setLocalState(newServerAwareness)
  }
}
