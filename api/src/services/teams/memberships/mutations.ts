import {
  NotifyNewRoleData,
  NotifyRemovedFromTeamData,
  NotifyMemberLeftData,
} from '@apiteam/mailman'
import { TeamRole, UserAsPersonal } from '@apiteam/types'
import { Membership } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { deleteMembership, updateMembership } from 'src/helpers'
import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { getCoreCacheReadRedis } from 'src/lib/redis'
import { TeamModel, UserModel } from 'src/models'
import {
  checkAuthenticated,
  checkMember,
  checkOwnerAdmin,
} from 'src/services/guards'

export const removeUserFromTeam = async ({
  userId,
  teamId,
}: {
  userId: string
  teamId: string
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
      `User with id '${user.id}' is the owner of team '${team.name}', owner must be changed before removing user`
    )
  }

  await deleteMembership(membership)

  await dispatchEmail({
    template: 'notify-removed-from-team',
    to: user.email,
    data: {
      targetName: user.firstName,
      teamName: team.name,
    } as NotifyRemovedFromTeamData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
  })

  return { ...membership, user }
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

  await dispatchEmail({
    template: 'notify-new-role',
    to: user.email,
    data: {
      targetName: user.firstName,
      teamName: team.name,
      newRole: role,
    } as NotifyNewRoleData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
  })

  return { ...updatedMembership, user }
}

export const leaveTeam = async ({ teamId }: { teamId: string }) => {
  const user = await checkAuthenticated()
  const membership = await checkMember({ teamId })

  if (membership.role === 'OWNER') {
    throw new ServiceValidationError(
      "You can't leave a team you own. Please transfer ownership to another member first."
    )
  }

  const team = await TeamModel.get(teamId)

  if (!team) {
    throw new ServiceValidationError(`Team not found with id '${teamId}'`)
  }

  await deleteMembership(membership)

  await dispatchEmail({
    template: 'notify-removed-from-team',
    to: user.email,
    data: {
      targetName: user.firstName,
      teamName: team.name,
      requestedToLeave: true,
    } as NotifyRemovedFromTeamData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
  })

  const adminOwners = await getAdminOwners(teamId)

  await Promise.all(
    adminOwners.map(async (adminOwner) =>
      dispatchEmail({
        template: 'notify-member-left',
        to: adminOwner.email,
        data: {
          recipientFirstName: adminOwner.firstName,
          targetFirstName: user.firstName,
          targetLastName: user.lastName,
          teamName: team.name,
        } as NotifyMemberLeftData,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(adminOwner),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
          adminOwner.email
        ),
      })
    )
  )

  return true
}

const getAdminOwners = async (teamId: string): Promise<UserAsPersonal[]> => {
  // Tell owners and admins that user left the team
  const allTeamInfo = await (
    await getCoreCacheReadRedis()
  ).hGetAll(`team:${teamId}`)

  const ownerAdminMemberships = [] as Membership[]

  Object.entries(allTeamInfo).forEach(([key, value]) => {
    if (key.startsWith('membership:')) {
      const membership = JSON.parse(value) as Membership
      if (membership.role === 'OWNER' || membership.role === 'ADMIN') {
        ownerAdminMemberships.push(membership)
      }
    }
  })

  if (ownerAdminMemberships.length === 0) {
    throw new Error('Team has no owners or admins')
  }

  return (
    await UserModel.getMany(
      ownerAdminMemberships.map((membership) => membership.userId)
    )
  ).filter((u) => u !== null) as UserAsPersonal[]
}
