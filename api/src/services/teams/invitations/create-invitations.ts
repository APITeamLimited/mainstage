import { MailmanInput, TeamInvitationData } from '@apiteam/mailman'
import { UserAsPersonal } from '@apiteam/types'
import { Team } from '@prisma/client'
import * as Yup from 'yup'

import { ServiceValidationError } from '@redwoodjs/api'

import { getFreePlanInfo } from 'src/helpers/billing'
import {
  generateAcceptInvitationUrl,
  generateBlanketUnsubscribeUrl,
  generateDeclineInvitationUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { PlanInfoModel, TeamModel } from 'src/models'
import { setInvitationRedis } from 'src/models/invitation'
import { UserModel } from 'src/models/user'
import { checkAuthenticated, checkOwnerAdmin } from 'src/services/guards'

import { InvitationInput } from './team-admin'

export const invitationCreateSchema = Yup.object({
  pairs: Yup.array().of(
    Yup.object().shape({
      email: Yup.string().email().required(),
      role: Yup.string().oneOf(['ADMIN', 'MEMBER']).required(),
    })
  ),
})

export const createInvitations = async ({
  teamId,
  invitations,
}: {
  teamId: string
  invitations: InvitationInput[]
}) => {
  const invitingUser = await checkAuthenticated()
  await checkOwnerAdmin({ teamId })

  await invitationCreateSchema.validate({ pairs: invitations }).catch((err) => {
    throw new ServiceValidationError(err.errors)
  })

  // Ensure length at least 1
  if (invitations.length < 1) {
    throw new ServiceValidationError('At least one invitation is required')
  }

  // Ensure all emails are lowercase
  invitations = invitations.map((i) => ({
    ...i,
    email: i.email.toLowerCase(),
  }))

  // Ensure all emails are unique
  if (new Set(invitations.map((i) => i.email)).size !== invitations.length) {
    throw new ServiceValidationError('Emails must be unique')
  }

  const [existingMemberships, existingInvitations, team] = await Promise.all([
    db.membership.findMany({
      where: {
        team: { id: teamId },
      },
    }),
    db.invitation.findMany({
      where: {
        team: { id: teamId },
      },
    }),
    TeamModel.get(teamId),
  ])

  if (!team) {
    throw new Error('Team not found')
  }

  await checkTeamCapacity(
    team,
    invitations.length,
    existingInvitations.length,
    existingMemberships.length
  )

  const existingUsers = (
    await UserModel.getMany(
      existingMemberships.map((membership) => membership.userId)
    )
  ).filter((user) => user !== null) as UserAsPersonal[]

  // Check if user exists for each invitation
  const existingUserEmails = existingUsers.map((u) => u.email)

  // Check if any of the emails are already members of the team
  if (
    invitations.some((invitation) =>
      existingUserEmails.includes(invitation.email)
    )
  ) {
    throw new ServiceValidationError(
      'One or more of the emails provided are already members of the team'
    )
  }

  const existingInvites = existingInvitations.map((i) => i.email)

  // Check if any of the emails are already invited to the team
  if (
    invitations.some((invitation) => existingInvites.includes(invitation.email))
  ) {
    throw new ServiceValidationError(
      'One or more of the emails provided are already invited to the team'
    )
  }

  // Create and return new invitations
  const newInvitations = await Promise.all(
    invitations.map((invitation) =>
      db.invitation.create({
        data: {
          email: invitation.email,
          role: invitation.role,
          team: { connect: { id: teamId } },
        },
      })
    )
  )

  const existingNonTeamUsers = (
    await Promise.all(
      newInvitations.map((invitation) =>
        UserModel.getIndexedField('email', invitation.email)
      )
    )
  ).filter((user) => user !== null) as UserAsPersonal[]

  await Promise.all([
    ...newInvitations.map((invitation) => setInvitationRedis(invitation)),
    ...newInvitations.map(async (invitation) => {
      const existingUser =
        existingNonTeamUsers.find((user) => user.email === invitation.email) ||
        null

      const blanketUnsubscribeUrlPromise = generateBlanketUnsubscribeUrl(
        invitation.email
      )

      const userUnsubscribeUrlPromise = existingUser
        ? generateUserUnsubscribeUrl(existingUser)
        : Promise.resolve(null)

      const acceptLinkPromise = generateAcceptInvitationUrl(
        invitation.id,
        team.name,
        invitation.email
      )

      const declineLinkPromise = generateDeclineInvitationUrl(
        invitation.id,
        team.name,
        invitation.email
      )

      const [
        blanketUnsubscribeUrl,
        userUnsubscribeUrl,
        acceptLink,
        declineLink,
      ] = await Promise.all([
        blanketUnsubscribeUrlPromise,
        userUnsubscribeUrlPromise,
        acceptLinkPromise,
        declineLinkPromise,
      ])

      const input: MailmanInput<TeamInvitationData> = {
        to: invitation.email,
        template: 'team-invitation',
        blanketUnsubscribeUrl,
        userUnsubscribeUrl,
        data: {
          inviteeFirstName: existingUser ? existingUser.firstName : null,
          isExistingUser: existingUser !== null,
          inviterFirstName: invitingUser.firstName,
          inviterLastName: invitingUser.lastName,
          teamName: team.name,
          acceptLink,
          declineLink,
        },
      }

      return dispatchEmail(input)
    }),
  ])

  return newInvitations
}

const checkTeamCapacity = async (
  team: Team,
  invitationCount: number,
  existingInvitationsLength: number,
  existingMembershipsLength: number
) => {
  const planInfo = team.planInfoId
    ? await PlanInfoModel.get(team.planInfoId)
    : await getFreePlanInfo()

  if (!planInfo) {
    throw new Error('Failed to get planInfo while checkingCapacity')
  }

  if (planInfo.maxMembers === -1) return

  if (
    existingInvitationsLength + existingMembershipsLength + invitationCount >
    planInfo.maxMembers
  ) {
    throw new ServiceValidationError(
      `Adding ${invitationCount} invitations would exceed the team's capacity of ${planInfo.maxMembers}`
    )
  }
}
