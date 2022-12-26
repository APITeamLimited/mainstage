import {
  getDisplayName,
  ServerAwareness,
  TeamRole,
  UserAsTeam,
  userAsTeam,
} from '@apiteam/types'
import type { Membership } from '@prisma/client'

import { getReadRedis, getSubscribeRedis } from '../../redis'
import {
  handleAddSubscription,
  handleRemoveSubscription,
  OpenDoc,
} from '../connection-provider'

import { createMemberAwareness } from './awareness'

export const addMemberHandler = async (
  openDoc: OpenDoc,
  member: Membership
) => {
  if (openDoc.serverAwareness.variant !== 'TEAM') {
    console.warn(
      `Tried to add member to a ${openDoc.serverAwareness.variant} doc, ignoring`
    )
    return
  }

  const userRedisKey = `user__id:${member.userId}`
  const coreCacheReadRedis = await getReadRedis()

  const userRaw = await coreCacheReadRedis.get(userRedisKey)
  if (!userRaw) {
    console.warn(
      `Could not find user ${member.userId} in cache, skipping adding to team ${openDoc.serverAwareness.variantTargetId}`
    )
    return
  }

  const user = userAsTeam(JSON.parse(userRaw))

  openDoc.activeSubscriptions.push(member.userId)
  handleAddSubscription(userRedisKey)

  const subscribeRedis = await getSubscribeRedis()
  subscribeRedis.subscribe(userRedisKey, (message) =>
    openDoc.updateMemberUser(userAsTeam(JSON.parse(message)))
  )

  const newServerAwareness: ServerAwareness = {
    ...openDoc.serverAwareness,
    members: [
      ...openDoc.serverAwareness.members,
      createMemberAwareness(user, member, []),
    ],
  }

  openDoc.setAndBroadcastServerAwareness(newServerAwareness)
}

export const changeRoleMemberHandler = (
  openDoc: OpenDoc,
  member: Membership
) => {
  if (openDoc.serverAwareness.variant !== 'TEAM') {
    console.warn(
      `Tried to change role of member from a ${openDoc.serverAwareness.variant} doc, ignoring`
    )
    return
  }

  const newServerAwareness: ServerAwareness = {
    ...openDoc.serverAwareness,
    members: openDoc.serverAwareness.members.map((m) =>
      m.userId === member.userId ? { ...m, role: member.role as TeamRole } : m
    ),
  }

  openDoc.setAndBroadcastServerAwareness(newServerAwareness)
}

export const updateMemberUserHandler = (openDoc: OpenDoc, user: UserAsTeam) => {
  if (openDoc.serverAwareness.variant !== 'TEAM') {
    console.warn(
      `Tried to update member from a ${openDoc.serverAwareness.variant} doc, ignoring`
    )
    return
  }

  const newServerAwareness: ServerAwareness = {
    ...openDoc.serverAwareness,
    members: openDoc.serverAwareness.members.map((m) =>
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

  openDoc.setAndBroadcastServerAwareness(newServerAwareness)
}

export const removeMemberHandler = async (
  openDoc: OpenDoc,
  member: Membership
) => {
  if (openDoc.serverAwareness.variant !== 'TEAM') {
    console.warn(
      `Tried to remove member from a ${openDoc.serverAwareness.variant} doc, ignoring`
    )
    return
  }

  const newServerAwareness: ServerAwareness = {
    ...openDoc.serverAwareness,
    members: openDoc.serverAwareness.members.filter(
      (m) => m.userId !== member.userId
    ),
  }

  openDoc.setAndBroadcastServerAwareness(newServerAwareness)

  const subscriptionName = `user__id:${member.userId}`

  openDoc.activeSubscriptions = openDoc.activeSubscriptions.filter(
    (s) => s !== subscriptionName
  )

  await handleRemoveSubscription(subscriptionName)
}
