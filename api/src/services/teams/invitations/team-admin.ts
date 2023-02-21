import { Invitation } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { db } from '../../../lib/db'
import { getCoreCacheReadRedis } from '../../../lib/redis'
import {
  deleteInvitationRedis,
  setInvitationRedis,
} from '../../../models/invitation'
import { checkOwnerAdmin } from '../../../services/guards'

import { invitationCreateSchema } from './create-invitations'

export type InvitationInput = {
  email: string
  role: 'ADMIN' | 'MEMBER'
}

export const invitations = async ({ teamId }: { teamId: string }) => {
  await checkOwnerAdmin({ teamId })

  const coreCacheReadRedis = await getCoreCacheReadRedis()

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
