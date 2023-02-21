import { NotifyAcceptInvitationData } from '@apiteam/mailman'
import {
  InvitationDecodedToken,
  TeamRole,
  UserAsPersonal,
} from '@apiteam/types-commonjs'
import { Team, Scope, Membership } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from '../../../config'
import { createMembership } from '../../../helpers'
import {
  acceptInvitationAudience,
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from '../../../helpers/routing'
import { db } from '../../../lib/db'
import { dispatchEmail } from '../../../lib/mailman'
import { getCoreCacheReadRedis } from '../../../lib/redis'
import { deleteInvitationRedis } from '../../../models/invitation'
import { UserModel } from '../../../models/user'
import { getKeyPair } from '../../../services/bearer/bearer'

const issuer = checkValue<string>('api.bearer.issuer')

export const acceptInvitation = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken:
    | (JWT.Jwt & {
        payload: InvitationDecodedToken
      })
    | undefined = undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: acceptInvitationAudience,
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

  const user = await UserModel.getIndexedField(
    'email',
    decodedToken.payload.invitationEmail
  )

  if (!user) {
    throw new ServiceValidationError(
      `User not found with email ${decodedToken.payload.invitationEmail}`
    )
  }

  const coreCacheReadRedis = await getCoreCacheReadRedis()

  const teamRaw = await coreCacheReadRedis.hGet(
    `team:${invitation.teamId}`,
    'team'
  )

  if (!teamRaw) {
    throw new ServiceValidationError('Team not found')
  }

  const team = JSON.parse(teamRaw) as Team

  await Promise.all([
    createMembership(team, user, invitation.role as TeamRole),
    db.invitation.delete({
      where: {
        id: invitation.id,
      },
    }),
    deleteInvitationRedis(invitation),
  ])

  // Tell owners and admins that the invitation was accepted
  const allTeamInfo = await coreCacheReadRedis.hGetAll(
    `team:${invitation.teamId}`
  )

  const ownerAdminMemberships = [] as Membership[]

  // Filter out the user who accepted the invitation
  Object.entries(allTeamInfo).forEach(([key, value]) => {
    if (key.startsWith('membership:')) {
      const membership = JSON.parse(value) as Membership
      if (
        (membership.role === 'OWNER' || membership.role === 'ADMIN') &&
        membership.userId !== user.id
      ) {
        ownerAdminMemberships.push(membership)
      }
    }
  })

  if (ownerAdminMemberships.length === 0) {
    throw new Error('Team has no owners or admins')
  }

  const ownerAdminUsers = (
    await UserModel.getMany(
      ownerAdminMemberships.map((membership) => membership.userId)
    )
  ).filter((u) => u !== null) as UserAsPersonal[]

  await Promise.all(
    ownerAdminUsers.map(async (adminUser) =>
      dispatchEmail({
        template: 'notify-accept-invitation',
        to: adminUser.email,
        data: {
          teamName: team.name,
          targetFirstName: user.firstName,
          targetLastName: user.lastName,
          recipientFirstName: adminUser.firstName,
        } as NotifyAcceptInvitationData,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(adminUser),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
          adminUser.email
        ),
      })
    )
  )

  // Return the users scope for the team
  const userScopesRaw = await coreCacheReadRedis.hGetAll(
    `scope__userId:${user?.id}`
  )

  const userScopeRaw = Object.values(userScopesRaw).find((rawScope) => {
    const scope = JSON.parse(rawScope) as Scope
    return scope.variant === 'TEAM' && scope.variantTargetId === team.id
  })

  if (!userScopeRaw) {
    throw new ServiceValidationError('User scope not found')
  }

  const userScope = JSON.parse(userScopeRaw) as Scope

  return userScope.id
}
