import { NotifyRemovedFromTeamDowngradeData } from '@apiteam/mailman'
import type { Team, PlanInfo, Membership } from '@prisma/client'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { db } from 'src/lib/db'
import { dispatchEmail, DispatchEmailInput } from 'src/lib/mailman'

import { InvitationModel } from '../invitation'
import { UserModel } from '../user'

import { TeamModel } from '.'

/**
 * If switching to the free plan, may be over the free user limit
 * If so, remove invitations first, then members, then admins
 */
export const determineIfNeedKickMembers = async (
  team: Team,
  planInfo: PlanInfo
) => {
  if (planInfo.priceMonthlyCents !== 0 || planInfo.maxMembers === -1) {
    return
  }

  const invitations = await db.invitation.findMany({
    where: {
      teamId: team.id,
    },
  })

  const memberships = await db.membership.findMany({
    where: {
      teamId: team.id,
    },
  })

  if (invitations.length + memberships.length <= planInfo.maxMembers) {
    return
  }

  // Remove most recent invitations first

  const sortedInvitations = invitations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  for (const invitation of sortedInvitations) {
    if (invitations.length + memberships.length <= planInfo.maxMembers) {
      break
    }

    await InvitationModel.delete(invitation.id)
    invitations.splice(invitations.indexOf(invitation), 1)
  }

  // Remove normal memberships first
  const normalMemberships = memberships.filter((m) => m.role === 'MEMBER')

  const kickPromises = [] as Promise<Membership | void>[]

  for (const membership of normalMemberships) {
    if (invitations.length + memberships.length <= planInfo.maxMembers) {
      break
    }

    kickPromises.push(TeamModel.deleteMembership(membership.id))
    kickPromises.push(sendNotifyKickedFromTeam(team, membership))
    memberships.splice(memberships.indexOf(membership), 1)
  }

  // Remove admin memberships
  const adminMemberships = memberships.filter((m) => m.role === 'ADMIN')

  for (const membership of adminMemberships) {
    if (invitations.length + memberships.length <= planInfo.maxMembers) {
      break
    }

    kickPromises.push(TeamModel.deleteMembership(membership.id))
    kickPromises.push(sendNotifyKickedFromTeam(team, membership))
    memberships.splice(memberships.indexOf(membership), 1)
  }

  await Promise.all(kickPromises)
}

const sendNotifyKickedFromTeam = async (team: Team, membership: Membership) => {
  const user = await UserModel.get(membership.userId).then((user) => {
    if (!user) {
      throw new Error(`User not found: ${membership.userId}`)
    }

    return user
  })

  const mailmanInput: DispatchEmailInput<NotifyRemovedFromTeamDowngradeData> = {
    template: 'notify-removed-from-team-downgrade',
    to: user.email,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
    data: {
      targetName: `${user.firstName} ${user.lastName}`,
      workspaceName: team.name,
    },
  }

  return dispatchEmail(mailmanInput)
}
