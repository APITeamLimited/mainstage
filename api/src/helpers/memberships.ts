import { TeamRole, UserAsPersonal } from '@apiteam/types'
import { Team, Membership, Scope } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { db } from 'src/lib/db'
import { getCoreCacheReadRedis } from 'src/lib/redis'
import { PlanInfoModel } from 'src/models/billing/plan-info'
import { ScopeModel } from 'src/models/scope'

import { getFreePlanInfo } from './billing'
import { createTeamScope } from './scopes'

/*
Creates a membership and scopes for a user in a team
*/
export const createMembership = async (
  team: Team,
  user: UserAsPersonal,
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

  const planInfo = team.planInfoId
    ? await PlanInfoModel.get(team.planInfoId)
    : await getFreePlanInfo()

  if (!planInfo) {
    throw new Error('No plan info found')
  }

  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.hSet(
      `team:${team.id}`,
      `membership:${membership.id}`,
      JSON.stringify(membership)
    ),
    coreCacheReadRedis.publish(
      `team:${team.id}`,
      JSON.stringify({
        type: 'ADD_MEMBER',
        payload: membership,
      })
    ),
    createTeamScope(team, membership, user, planInfo),
  ])

  return membership
}

export const deleteMembership = async (membership: Membership) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  const oldScopesRaw = await coreCacheReadRedis.hGetAll(
    `scope__userId:${membership.userId}`
  )

  const oldScopes = Object.values(oldScopesRaw).map(
    (scope) => JSON.parse(scope) as Scope
  )
  const { teamId, userId } = membership

  // Find scope matching team
  const scopeToDelete = oldScopes.find(
    (scope) => scope.variant === 'TEAM' && scope.variantTargetId === teamId
  )

  const scopeToDeletePromise = scopeToDelete
    ? ScopeModel.delete(scopeToDelete.id)
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
  user: UserAsPersonal | null = null
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

  const planInfo = team.planInfoId
    ? await PlanInfoModel.get(team.planInfoId)
    : await getFreePlanInfo()

  if (!planInfo) {
    throw new Error('No plan info found')
  }

  const updateTeamScopePromise = createTeamScope(
    team,
    updatedMembership,
    user,
    planInfo
  )

  await Promise.all([setPromise, publishPromise, updateTeamScopePromise])

  return updatedMembership
}
