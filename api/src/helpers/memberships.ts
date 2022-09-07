import { SafeUser, TeamRole } from '@apiteam/types'
import { Team, Membership } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { scopes } from 'src/lib/scopes'

import { createTeamScope, deleteScope } from './scopes'

/*
Creates a membership and scopes for a user in a team
*/
export const createMembership = async (
  team: Team,
  user: SafeUser,
  role: TeamRole
): Promise<Membership> => {
  // Create membership
  const membership = await db.membership.create({
    data: {
      team: { connect: { id: team.id } },
      user: { connect: { id: user.id } },
      role,
    },
  })

  const setPromise = coreCacheReadRedis.hSet(
    `team:${team.id}`,
    `membership:${membership.id}`,
    JSON.stringify(membership)
  )

  const publishPromise = coreCacheReadRedis.publish(
    `team:${team.id}`,
    JSON.stringify({
      type: 'ADD_MEMBER',
      payload: membership,
    })
  )

  await Promise.all([
    setPromise,
    publishPromise,
    createTeamScope(team, membership, user),
  ])

  return membership
}

export const deleteMembership = async (membership: Membership) => {
  const oldScopes = await scopes()
  const { teamId, userId } = membership

  // Find scope matching team
  const scopeToDelete = oldScopes.find(
    (scope) => scope.variant === 'TEAM' && scope.variantTargetId === teamId
  )

  const scopeToDeletePromise = scopeToDelete
    ? deleteScope(scopeToDelete.id)
    : Promise.resolve()

  // Delete membership
  const dbPromise = await db.membership.deleteMany({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  const delCorePromise = coreCacheReadRedis.hDel(
    `team:${teamId}`,
    `membership:${membership?.id}`
  )

  const publishPromise = coreCacheReadRedis.publish(
    `team:${teamId}`,
    JSON.stringify({
      type: 'REMOVE_MEMBER',
      payload: membership,
    })
  )

  await Promise.all([
    dbPromise,
    delCorePromise,
    publishPromise,
    scopeToDeletePromise,
  ])
}

export const updateMembership = async (
  membership: Membership,
  role: TeamRole,
  team: Team | null = null,
  user: SafeUser | null = null
) => {
  const { teamId, userId } = membership

  if (!team) {
    team = await db.team.findUnique({ where: { id: teamId } })
    if (!team) {
      throw new ServiceValidationError(`Team with id '${teamId}' not found`)
    }
  }

  if (!user) {
    user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new ServiceValidationError(`User with id '${userId}' not found`)
    }
  }

  const updatedMembership = await db.membership.update({
    where: { id: membership.id },
    data: { role },
  })

  const setPromise = coreCacheReadRedis.hSet(
    `team:${teamId}`,
    `membership:${membership.id}`,
    JSON.stringify(updatedMembership)
  )

  const publishPromise = coreCacheReadRedis.publish(
    `team:${teamId}`,
    JSON.stringify({
      type: 'CHANGE_ROLE',
      payload: updatedMembership,
    })
  )

  const updateTeamScopePromise = setTeamScope(team, membership, user)

  await Promise.all([setPromise, publishPromise, updateTeamScopePromise])

  return updatedMembership
}
