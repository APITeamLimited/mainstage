import {
  DecodedPublicBearer,
  UserAsTeam,
  ServerAwareness,
} from '@apiteam/types'
import type { Scope, Membership } from '@prisma/client'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import type { Socket } from 'socket.io'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import { checkValue } from '../../config'
import { populateOpenDoc } from '../../entities'
import {
  handleRemoveSubscription,
  messageAwarenessType,
  messageSyncType,
  openDocs,
} from '../connection-provider'
import * as syncProtocol from '../sync'

import {
  connectAwarenessHandler,
  updateServerAwarenessHandler,
  verifyAwarenessHandler,
} from './awareness'
import {
  addMemberHandler,
  changeRoleMemberHandler,
  removeMemberHandler,
  updateMemberUserHandler,
} from './members'
import { cleanupStoreReceipts } from './store-receipts'

export const publicAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-public`
export const issuer = checkValue<string>('api.bearer.issuer')

export class OpenDoc extends Y.Doc {
  serversideSockets: Set<Socket> = new Set()
  sockets: Map<Socket, Set<number>>
  scopes: Map<Socket, Set<Scope>>
  awareness: awarenessProtocol.Awareness
  variant: string
  variantTargetId: string
  lastVerifiedClients: Map<number, number>
  activeSubscriptions: string[]
  updateCallback: ((docName: string, update: Uint8Array) => void) | undefined
  cleanupInterval: NodeJS.Timeout | undefined

  constructor(
    scope: Scope,
    updateCallback: ((docName: string, update: Uint8Array) => void) | undefined
  ) {
    super({
      gc: true,
    })

    this.variant = scope.variant
    this.variantTargetId = scope.variantTargetId
    this.guid = `${scope.variant}:${scope.variantTargetId}`

    this.scopes = new Map()
    this.sockets = new Map()
    this.serversideSockets = new Set()
    this.lastVerifiedClients = new Map()
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)

    this.activeSubscriptions = []
    this.updateCallback = updateCallback

    this.cleanupInterval = setInterval(() => {
      cleanupStoreReceipts(this)
    }, 1000 * 60 * 5)

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
      this.updateCallback?.(this.guid, update)
    })

    populateOpenDoc(this)
  }

  async send(socket: Socket, m: Uint8Array, acknowledge = false) {
    if (!socket.connected) {
      console.log('dc close 6')
      this.closeSocket(socket)
      return
    }

    try {
      if (acknowledge) {
        await new Promise((resolve) => {
          socket.once('acknowledge-data', resolve)
          socket.send(m)
        })
      } else {
        socket.send(m)
      }
    } catch (e) {
      console.warn('failed to send message from OpenDoc', e)
      console.log('dc close 8')
      this.closeSocket(socket)
    }
  }

  // Removes a connection from a doc
  async closeSocket(socket: Socket) {
    // Find client ids that are controlled by this socket
    if (this.sockets.has(socket)) {
      const controlledIds: Set<number> = this.sockets.get(socket) || new Set()
      this.sockets.delete(socket)

      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      )
    }

    this.scopes.delete(socket)
    console.log('close socket')

    socket.disconnect()

    // Close doc if no more connections
    if (this.sockets.size === 0 && this.serversideSockets.size === 0) {
      await this.closeDoc()
    }
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

  setAndBroadcastServerAwareness(serverAwareness: ServerAwareness) {
    this.awareness.setLocalState(serverAwareness)
    const encoder = encoding.createEncoder()

    encoding.writeVarUint(encoder, messageAwarenessType)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        Array.from(this.awareness.getStates().keys())
      )
    )

    // Send to all clients
    Array.from(this.sockets.keys()).forEach((socket) => {
      socket.send(encoding.toUint8Array(encoder))
    })
  }

  async closeDoc() {
    await Promise.all(this.activeSubscriptions.map(handleRemoveSubscription))

    this.cleanupInterval && clearInterval(this.cleanupInterval)
    this.cleanupInterval = undefined

    await cleanupStoreReceipts(this)

    // Remove all sockets
    this.sockets.forEach((_, socket) => {
      console.log('dc close 9')
      this.closeSocket(socket)
    })

    // Remove all serverside sockets
    this.serversideSockets.forEach((socket) => {
      console.log('dc close 10')
      this.closeSocket(socket)
    })

    // Clear sockets
    this.sockets.clear()
    this.serversideSockets.clear()

    openDocs.delete(this.guid)

    super.destroy()
  }

  deleteServersideSocket(socket: Socket) {
    this.serversideSockets.delete(socket)
    socket.disconnect()

    if (this.serversideSockets.size === 0 && this.sockets.size === 0) {
      this.closeDoc()
    }
  }

  async disconnectClient(clientID: number) {
    const socket: Socket | null = null

    for (const [socket, controlledIDs] of this.sockets) {
      if (controlledIDs.has(clientID)) {
        return socket
      }
    }

    if (!socket) {
      // If no socket is found, the client is not connected to the doc
      this.lastVerifiedClients.delete(clientID)
      return
    }

    console.log('dc close 11')
    await this.closeSocket(socket)
    this.lastVerifiedClients.delete(clientID)
  }

  get serverAwareness() {
    return this.awareness.getLocalState() as ServerAwareness
  }

  publishDeletion(variant: 'TEAM' | 'USER') {
    if (variant === 'TEAM') {
      Array.from(this.sockets.keys()).forEach((socket) => {
        socket.emit('doc-deleted')
      })
    } else {
      Array.from(this.sockets.keys()).forEach((socket) => {
        socket.emit('doc-deleted-user')
      })
    }
  }

  notifyKick(userId: string) {
    Array.from(this.sockets.keys()).forEach((socket) => {
      socket.emit('kicked', userId)
    })
  }

  // Awareness

  async connectAwareness() {
    await connectAwarenessHandler(this)
  }

  async updateServerAwareness(decodedToken: DecodedPublicBearer) {
    await updateServerAwarenessHandler(this, decodedToken)
  }

  /**  Verify tokens of all clients and boot them if they are invalid, if they are
  valid,their awareness is */
  async verifyAwareness(socket: Socket, clientID: number, finalChance = false) {
    await verifyAwarenessHandler(this, socket, clientID, finalChance)
  }

  // Members

  async addMember(member: Membership) {
    await addMemberHandler(this, member)
  }

  async removeMember(member: Membership) {
    await removeMemberHandler(this, member)
  }

  changeRoleMember(member: Membership) {
    changeRoleMemberHandler(this, member)
  }

  updateMemberUser(user: UserAsTeam) {
    updateMemberUserHandler(this, user)
  }
}
