import { MailmanInput, TeamInvitationData } from '@apiteam/mailman'
import { SafeUser } from '@apiteam/types'
import { Invitation } from '@prisma/client'
import { Team } from '@prisma/client'
import * as Yup from 'yup'

import { ServiceValidationError } from '@redwoodjs/api'

import {
  deleteInvitationRedis,
  setInvitationRedis,
} from 'src/helpers/invitations'
import {
  generateAcceptInvitationUrl,
  generateBlanketUnsubscribeUrl,
  generateDeclineInvitationUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'

import { checkOwnerAdmin } from '../validators'

type InvitationInput = {
  email: string
  role: 'ADMIN' | 'MEMBER'
}

const invitationCreateSchema = Yup.object({
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
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to create an invitation.'
    )
  }

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

  const existingMembershipsPromise = db.membership.findMany({
    where: {
      team: { id: teamId },
    },
  })

  const existingInvitationsPromise = db.invitation.findMany({
    where: {
      team: { id: teamId },
    },
  })

  const invitingUserRawPromise = coreCacheReadRedis.get(
    `user__id:${context.currentUser.id}`
  )
  const teamRawPromise = coreCacheReadRedis.hGet(`team:${teamId}`, 'team')

  const [existingMemberships, existingInvitations, invitingUserRaw, teamRaw] =
    await Promise.all([
      existingMembershipsPromise,
      existingInvitationsPromise,
      invitingUserRawPromise,
      teamRawPromise,
    ])

  if (!invitingUserRaw) {
    throw new ServiceValidationError(
      'Inviting user not found, contact support.'
    )
  }

  const invitingUser: SafeUser = JSON.parse(invitingUserRaw)

  if (!teamRaw) {
    throw new ServiceValidationError('Team not found, contact support.')
  }

  const team = JSON.parse(teamRaw) as Team

  const existingUserIds = existingMemberships.map((m) => m.userId)

  // Check if user exists for each invitation
  const existingUsersRaw =
    existingUserIds.length > 0
      ? await coreCacheReadRedis.mGet(existingUserIds)
      : []

  const existingUsers = existingUsersRaw
    .map((user) => {
      if (user) {
        return JSON.parse(user) as SafeUser
      }
      return null
    })
    .filter((user) => user !== null) as SafeUser[]

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

  const existingNonTeamUsersRaw =
    newInvitations.length > 0
      ? await coreCacheReadRedis.mGet(
          newInvitations.map((i) => `user__email:${i.email}`)
        )
      : []

  const existingNonTeamUsers = existingNonTeamUsersRaw
    .filter((u) => u !== null)
    .map((u) => JSON.parse(u || '') as SafeUser)

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

export const invitations = async ({ teamId }: { teamId: string }) => {
  await checkOwnerAdmin({ teamId })

  const ids = await coreCacheReadRedis.sMembers(`invitation__teamId:${teamId}`)

  const invitations = (
    ids.length > 0
      ? await coreCacheReadRedis.mGet(ids.map((id) => `invitation__id:${id}`))
      : []
  ).filter((i) => i !== null) as string[]

  return invitations.map((i) => JSON.parse(i) as Invitation)
}

export const updateInvitations = async ({
  teamId,
  invitations,
}: {
  teamId: string
  invitations: InvitationInput[]
}) => {
  await checkOwnerAdmin({ teamId })

  await invitationCreateSchema.validate({ pairs: invitations }).catch((err) => {
    throw new ServiceValidationError(err.errors)
  })

  const existingInvitations = await db.invitation.findMany({
    where: {
      team: { id: teamId },
    },
  })

  const existingInvites = existingInvitations.map((i) => i.email)

  // Check if any of the emails are not invited to the team
  if (
    invitations.some(
      (invitation) => !existingInvites.includes(invitation.email)
    )
  ) {
    throw new ServiceValidationError(
      'One or more of the emails provided are not already invited to the team'
    )
  }

  // Update and return new invitations
  const invitationsUpdated = await Promise.all(
    existingInvitations
      .map((invitation) => {
        const newInvitation = invitations.find(
          (i) => i.email === invitation.email
        )

        if (newInvitation) {
          return db.invitation.update({
            where: { id: invitation.id },
            data: {
              role: newInvitation.role,
            },
          })
        }
      })
      .filter((i) => i !== undefined)
  )

  await Promise.all(
    invitationsUpdated.map((invitation) => {
      if (invitation) {
        setInvitationRedis(invitation)
      }
    })
  )

  return invitationsUpdated
}

export const deleteInvitation = async ({
  teamId,
  email,
}: {
  teamId: string
  email: string
}) => {
  await checkOwnerAdmin({ teamId })

  const invitation = await db.invitation.findFirst({
    where: {
      team: { id: teamId },
      email,
    },
  })

  if (!invitation) {
    throw new ServiceValidationError('Invitation not found')
  }

  const dbDeletePromise = db.invitation.delete({
    where: {
      id: invitation.id,
    },
  })

  const redisDeletePromise = deleteInvitationRedis(invitation)

  await Promise.all([dbDeletePromise, redisDeletePromise])

  return invitation
}
