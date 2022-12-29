import { NotifyDeclineInvitationData } from '@apiteam/mailman'
import { InvitationDecodedToken, UserAsPersonal } from '@apiteam/types'
import { Membership, Team } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import {
  declineInvitationAudience,
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'
import { deleteInvitationRedis } from 'src/models/invitation'
import { UserModel } from 'src/models/user'
import { getKeyPair } from 'src/services/bearer/bearer'

const issuer = checkValue<string>('api.bearer.issuer')

export const declineInvitation = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken:
    | (JWT.Jwt & {
        payload: InvitationDecodedToken
      })
    | undefined = undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: declineInvitationAudience,
      complete: true,
    }) as JWT.Jwt & {
      payload: InvitationDecodedToken
    }
  } catch (error) {
    throw new ServiceValidationError('Invalid token')
  }

  if (
    typeof decodedToken.payload === 'string' ||
    !decodedToken.payload?.invitationId
  ) {
    throw new ServiceValidationError('Invalid token')
  }

  const invitation = await db.invitation.findUnique({
    where: {
      id: decodedToken?.payload.invitationId,
    },
  })

  if (!invitation) {
    throw new ServiceValidationError(
      'Invitation not found, it may have been deleted, declined or already accepted'
    )
  }

  // Tell owners and admins that the invitation was declined
  const allTeamInfo = await coreCacheReadRedis.hGetAll(
    `team:${invitation.teamId}`
  )

  const teamRecord = Object.entries(allTeamInfo).find(([key, _]) =>
    key === 'team' ? true : false
  )

  if (!teamRecord) throw new ServiceValidationError('Team not found')

  const team: Team = JSON.parse(teamRecord[1])

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

  const ownerAdminUsers = (
    await UserModel.getMany(
      ownerAdminMemberships.map((membership) => membership.id)
    )
  ).filter((u) => u !== null) as UserAsPersonal[]

  await Promise.all(
    ownerAdminUsers.map(async (adminUser) =>
      dispatchEmail({
        template: 'notify-decline-invitation',
        to: adminUser.email,
        data: {
          teamName: team.name,
          targetEmail: invitation.email,
          recipientFirstName: adminUser.firstName,
        } as NotifyDeclineInvitationData,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(adminUser),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
          adminUser.email
        ),
      })
    )
  )

  await Promise.all([
    db.invitation.delete({
      where: {
        id: invitation.id,
      },
    }),
    deleteInvitationRedis(invitation),
  ])

  return true
}
