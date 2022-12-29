import {
  getDisplayName,
  ServerAwareness,
  MemberAwareness,
  RedisTeamPublishMessage,
  DecodedPublicBearer,
  UserAsTeam,
} from '@apiteam/types'
import type { Membership, Scope } from '@prisma/client'
import * as JWT from 'jsonwebtoken'
import type { Socket } from 'socket.io'

import { getReadRedis } from '../../../redis'
import { getAndSetAPIPublicKey } from '../../../services'
import { issuer, OpenDoc, publicAudience } from '../open-doc'

export * from './connect-awareness'

export type LastOnlineTime = {
  userId: string
  lastOnline: Date
}

export const bannedAwarenessKeys = [
  'variantTargetId',
  'variant',
  'team',
  'members',
] as const

export const verifyAwarenessHandler = async (
  openDoc: OpenDoc,
  socket: Socket,
  clientID: number,
  finalChance: boolean
) => {
  if (clientID === openDoc.awareness.clientID) return

  const awareness = openDoc.awareness.getStates().get(clientID)
  if (!awareness) return

  // If pretending to be a server, disconnect
  if (bannedAwarenessKeys.some((k) => awareness[k])) {
    openDoc.closeSocket(socket)
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
        openDoc.disconnectClient(clientID)
        console.log('Disconnect1')
        return
      }

      const hasScope =
        (Array.from(openDoc.scopes.get(socket) || new Set()) as Scope[]).find(
          (s) => s.id === decodedToken.payload.scopeId
        ) !== undefined
          ? true
          : false
      if (!hasScope) {
        openDoc.disconnectClient(clientID)
        console.log('Disconnect2')
        return
      }

      // Successfully verified the token
      openDoc.lastVerifiedClients.set(clientID, new Date().getTime())
      await openDoc.updateServerAwareness(decodedToken)
      return
    } catch (e) {
      console.warn(
        `Failed to verify token for client ${clientID} an error occurred`,
        e
      )
      openDoc.disconnectClient(clientID)
      console.log('Disconnect3')
    }
  }

  if (finalChance) {
    openDoc.disconnectClient(clientID)
    console.log('Disconnect4')
    return
  }

  // Get client awareness again
  setTimeout(
    async () => await openDoc.verifyAwareness(socket, clientID, true),
    5000
  )
}

export const createMemberAwareness = (
  user: UserAsTeam,
  membership: Membership,
  lastOnlineTimes: LastOnlineTime[]
) =>
  ({
    userId: membership.userId,
    displayName: getDisplayName(user),
    role: membership.role,
    profilePicture: user.profilePicture,
    joinedTeam: membership.createdAt,
    lastOnline:
      lastOnlineTimes.find((l) => l.userId === membership.userId)?.lastOnline ||
      null,
  } as MemberAwareness)

export const updateServerAwarenessHandler = async (
  openDoc: OpenDoc,
  decodedToken: DecodedPublicBearer
) => {
  // Update last online time for the user
  const serverAwareness = openDoc.awareness.getLocalState() as ServerAwareness

  if (serverAwareness.variant === 'TEAM') {
    const member = serverAwareness.members.find(
      (m) => m.userId === decodedToken.payload.userId
    )

    if (!member) {
      throw new Error(
        `Could not find member ${decodedToken.payload.userId} in team ${openDoc.variantTargetId}`
      )
    }

    member.lastOnline = new Date()
    const readRedis = await getReadRedis()

    const setPromise = readRedis.hSet(
      `team:${openDoc.variantTargetId}`,
      `lastOnlineTime:${decodedToken.payload.userId}`,
      member.lastOnline.getTime()
    )

    const publishPromise = readRedis.publish(
      `team:${openDoc.variantTargetId}`,
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

    openDoc.setAndBroadcastServerAwareness(newServerAwareness)
  }
}
