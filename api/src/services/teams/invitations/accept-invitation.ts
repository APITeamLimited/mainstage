import { SafeUser, TeamRole } from '@apiteam/types'
import { Team } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import { createMembership } from 'src/helpers'
import {
  deleteInvitationRedis,
  setInvitationRedis,
} from 'src/helpers/invitations'
import { acceptInvitationAudience } from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { getKeyPair } from 'src/services/bearer/bearer'

const issuer = checkValue<string>('api.bearer.issuer')

export const acceptInvitation = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken: JWT.Jwt | undefined = undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: acceptInvitationAudience,
      complete: true,
    })
  } catch (error) {
    throw new ServiceValidationError('Invalid token')
  }

  if (
    typeof decodedToken.payload === 'string' ||
    !decodedToken.payload?.email
  ) {
    throw new ServiceValidationError('Invalid token')
  }

  const [invitation, userRaw] = await Promise.all([
    db.invitation.findUnique({
      where: {
        email: decodedToken?.payload.email,
      },
    }),
    coreCacheReadRedis.get(`user__email__${decodedToken.payload.email}`),
  ])

  if (!invitation || invitation.accepted) {
    throw new ServiceValidationError(
      'Invitation not found, it may have been deleted, declined or already accepted'
    )
  }

  const teamRaw = await coreCacheReadRedis.hGet(
    `team${invitation.teamId}`,
    'team'
  )
  if (!teamRaw) {
    throw new ServiceValidationError('Team not found')
  }

  const team = JSON.parse(teamRaw) as Team

  const user = (userRaw ? JSON.parse(userRaw) : null) as SafeUser | null

  if (user) {
    await Promise.all([
      createMembership(team, user, invitation.role as TeamRole),
      db.invitation.delete({
        where: {
          id: invitation.id,
        },
      }),
      deleteInvitationRedis(invitation),
    ])
  } else {
    const updatedInvitation = await db.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        accepted: true,
      },
    })

    await setInvitationRedis(updatedInvitation)
  }
}
