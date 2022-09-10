import {
  ConfirmChangeOwnerData,
  NotifyNewRoleData,
  NotifyRemovedFromTeamData,
} from '@apiteam/mailman'
import { SafeUser, TeamRole } from '@apiteam/types'

import { ServiceValidationError } from '@redwoodjs/api'

import { deleteMembership, updateMembership } from 'src/helpers'
import {
  generateBlanketUnsubscribeUrl,
  generateChangeOwnerUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'

import { checkOwner } from '../validators/check-owner'
import { checkOwnerAdmin } from '../validators/check-owner-admin'

export const sendChangeTeamOwnerEmail = async ({
  userId,
  teamId,
}: {
  userId: string
  teamId: string
}) => {
  await checkOwner({ teamId })

  if (!context.currentUser) {
    throw new ServiceValidationError('You must be logged in to do this.')
  }

  // Ensure userId is admin in team

  const userRaw = await coreCacheReadRedis.get(`user__id:${userId}`)
  if (!userRaw) {
    throw new ServiceValidationError(`User does not exist with id '${userId}'`)
  }
  const user = JSON.parse(userRaw) as SafeUser

  const team = await db.team.findUnique({
    where: { id: teamId },
  })

  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${teamId}'`)
  }

  const membership = await db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  if (!membership) {
    throw new ServiceValidationError(
      `User with id '${user.id}' was not found in your team`
    )
  }

  if (membership.role !== 'ADMIN') {
    throw new ServiceValidationError(
      `User with id '${user.id}' is not an admin in your team`
    )
  }

  await dispatchEmail({
    template: 'confirm-change-owner',
    to: user.email,
    data: {
      newOwnerFirstname: user.firstName,
      newOwnerLastname: user.lastName,
      newOwnerEmail: user.email,
      teamName: team.name,
      changeOwnerLink: await generateChangeOwnerUrl(
        teamId,
        team.name,
        user.email
      ),
      targetName: context.currentUser.firstName,
    } as ConfirmChangeOwnerData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
  })

  return true
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
