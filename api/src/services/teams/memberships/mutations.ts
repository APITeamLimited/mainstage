import { TeamRole } from '@apiteam/types'

import { ServiceValidationError } from '@redwoodjs/api'

import { deleteMembership, updateMembership } from 'src/helpers'
import { db } from 'src/lib/db'

import { checkOwner } from '../validators/check-owner'
import { checkOwnerAdmin } from '../validators/check-owner-admin'

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

  await deleteMembership(membership)

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
  const updatedMembership = await updateMembership(membership, role, team, user)

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
  const oldOwnerUpdatedPromise = await updateMembership(
    oldOwnerMembership,
    'ADMIN',
    team,
    oldOwner
  )

  const newOwnerUpdatedPromise = await updateMembership(
    newOwnerMembership,
    'OWNER',
    team,
    newOwner
  )

  const [oldOwnerUpdated, newOwnerUpdated] = await Promise.all([
    oldOwnerUpdatedPromise,
    newOwnerUpdatedPromise,
  ])

  // TODO: send email

  return {
    oldOwnerMembership: oldOwnerUpdated,
    newOwnerMembership: newOwnerUpdated,
  }
}
