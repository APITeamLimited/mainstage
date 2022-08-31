import { TeamRole } from 'types/src'

import { ServiceValidationError } from '@redwoodjs/api'

import { createMembership, createTeamScope, deleteScope } from 'src/helpers'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { scopes } from 'src/services/scopes/scopes'

import { checkOwner } from '../validators/check-owner'
import { checkOwnerAdmin } from '../validators/check-owner-admin'

export const addUserToTeam = async ({
  teamId,
  userId,
  role,
}: {
  userId: string
  teamId: string
  role: TeamRole
}) => {
  await checkOwnerAdmin({ teamId })

  const userPromise = await db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = await db.team.findUnique({
    where: { id: teamId },
  })

  const teamMembersPromise = db.membership.findMany({
    where: {
      team: { id: teamId },
    },
  })

  const [user, team, teamMembers] = await Promise.all([
    userPromise,
    teamPromise,
    teamMembersPromise,
  ])

  // Check user exists in db
  if (!user) {
    throw new ServiceValidationError(`User does not exist with id '${userId}'`)
  }

  // Check team exists in db
  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${teamId}'`)
  }

  if (teamMembers.length >= team.maxMembers) {
    throw new ServiceValidationError(
      `Team '${team.name}' has reached its maximum capacity of ${team.maxMembers} members`
    )
  }

  // Check user is not already a member of the team
  if (teamMembers.find((member) => member.userId === userId)) {
    throw new ServiceValidationError(
      `User with id '${userId}' is already a member of team '${team.name}'`
    )
  }

  // Create membership
  const membership = await createMembership(team, user, role)

  await createTeamScope(team, membership, user)

  // TODO: Send email

  return membership
}

export const removeUserFromTeam = async ({
  userId,
  teamId,
}: {
  userId: string
  teamId: string
}) => {
  await checkOwnerAdmin({ teamId })

  const userPromise = await db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = await db.team.findUnique({
    where: { id: teamId },
  })

  const membershipPromise = db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  const [user, team, membership] = await Promise.all([
    userPromise,
    teamPromise,
    membershipPromise,
  ])

  // Check user exists in db
  if (!user) {
    throw new ServiceValidationError(`User does not exist with id '${userId}'`)
  }

  // Check team exists in db
  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${teamId}'`)
  }

  // Check user is a member of the team
  if (!membership) {
    throw new ServiceValidationError(
      `User with id '${user.id}' is not a member of team '${team.name}'`
    )
  }

  // Check user is not the owner of the team
  if (membership.role === 'OWNER') {
    throw new ServiceValidationError(
      `User with id '${user.id}' is the owner of team '${team.name}', owner must be changed before removing user`
    )
  }

  const oldScopes = await scopes()

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

  // TODO: Send email

  return membership
}

export const changeUserRole = async ({
  userId,
  teamId,
  role,
}: {
  userId: string
  teamId: string
  role: TeamRole
}) => {
  await checkOwnerAdmin({ teamId })

  const userPromise = db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = db.team.findUnique({
    where: { id: teamId },
  })

  const membershipPromise = db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  const [user, team, membership] = await Promise.all([
    userPromise,
    teamPromise,
    membershipPromise,
  ])

  // Check user exists in db
  if (!user) {
    throw new ServiceValidationError(`User does not exist with id '${userId}'`)
  }

  // Check team exists in db
  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${teamId}'`)
  }

  // Check user is a member of the team
  if (!membership) {
    throw new ServiceValidationError(
      `User with id '${user.id}' is not a member of team '${team.name}'`
    )
  }

  // Check user is not the owner of the team
  if (membership.role === 'OWNER') {
    throw new ServiceValidationError(
      'Owner role must be changed using changeTeamOwner'
    )
  }

  // Check not trying to change to the same role
  if (membership.role === role) {
    throw new ServiceValidationError(
      `User with id '${user.id}' is already a ${role} of team '${team.name}'`
    )
  }

  // Update membership
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

  const updateTeamScopePromise = createTeamScope(team, membership, user)

  await Promise.all([setPromise, publishPromise, updateTeamScopePromise])

  // TODO: send email

  return updatedMembership
}

export const changeTeamOwner = async ({
  userId,
  teamId,
}: {
  userId: string
  teamId: string
}) => {
  await checkOwner({ teamId })

  if (!context.currentUser) {
    throw new ServiceValidationError('User is not logged in')
  }

  const oldOwnerPromise = db.user.findUnique({
    where: { id: context.currentUser.id },
  })

  const newOwnerPromise = db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = db.team.findUnique({
    where: { id: teamId },
  })

  const oldOwnerMembershipPromise = await db.membership.findFirst({
    where: {
      team: { id: teamId },
      role: 'OWNER',
    },
  })

  const newOwnerMembershipPromise = db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  const [oldOwner, newOwner, team, newOwnerMembership, oldOwnerMembership] =
    await Promise.all([
      oldOwnerPromise,
      newOwnerPromise,
      teamPromise,
      newOwnerMembershipPromise,
      oldOwnerMembershipPromise,
    ])

  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${teamId}'`)
  }

  if (!oldOwnerMembership) {
    throw new ServiceValidationError(
      `Old owner is not a member of team '${teamId}'`
    )
  }

  if (!oldOwner) {
    throw new ServiceValidationError(
      `Old owner does not exist with id '${userId}'`
    )
  }

  // Check user exists in db
  if (!newOwner) {
    throw new ServiceValidationError(
      `New owner does not exist with id '${userId}'`
    )
  }

  // Check user is a member of the team
  if (!newOwnerMembership) {
    throw new ServiceValidationError(
      `New owner with id '${newOwner.id}' is not a member of team '${teamId}'`
    )
  }

  // Check user is not the owner of the team
  if (newOwnerMembership.role === 'OWNER') {
    throw new ServiceValidationError(
      `User with id '${newOwner.id}' is already the owner of team '${teamId}'`
    )
  }

  // Update memberships
  const oldOwnerUpdatedPromise = db.membership.update({
    where: {
      id: oldOwnerMembership.id,
    },
    data: {
      role: 'ADMIN',
    },
  })

  const newOwnerUpdatedPromise = db.membership.update({
    where: {
      id: newOwnerMembership.id,
    },
    data: {
      role: 'OWNER',
    },
  })

  const [oldOwnerUpdated, newOwnerUpdated] = await Promise.all([
    oldOwnerUpdatedPromise,
    newOwnerUpdatedPromise,
  ])

  const setPromiseOldOwner = coreCacheReadRedis.hSet(
    `team:${teamId}`,
    `membership:${oldOwnerMembership.id}`,
    JSON.stringify(oldOwnerUpdated)
  )

  const setPromiseNewOwner = coreCacheReadRedis.hSet(
    `team:${teamId}`,
    `membership:${newOwnerMembership.id}`,
    JSON.stringify(newOwnerUpdated)
  )

  const publishPromiseOldOwner = coreCacheReadRedis.publish(
    `team:${teamId}`,
    JSON.stringify({
      type: 'CHANGE_ROLE',
      payload: oldOwnerUpdated,
    })
  )

  const publishPromiseNewOwner = coreCacheReadRedis.publish(
    `team:${teamId}`,
    JSON.stringify({
      type: 'CHANGE_ROLE',
      payload: newOwnerUpdated,
    })
  )

  const updateTeamScopeOldOwnerPromise = createTeamScope(
    team,
    oldOwnerUpdated,
    oldOwner
  )

  const updateTeamScopeNewOwnerPromise = createTeamScope(
    team,
    newOwnerUpdated,
    newOwner
  )

  await Promise.all([
    updateTeamScopeOldOwnerPromise,
    updateTeamScopeNewOwnerPromise,
    setPromiseOldOwner,
    setPromiseNewOwner,
    publishPromiseOldOwner,
    publishPromiseNewOwner,
  ])

  // TODO: send email

  return {
    oldOwnerMembership: oldOwnerUpdated,
    newOwnerMembership: newOwnerUpdated,
  }
}
