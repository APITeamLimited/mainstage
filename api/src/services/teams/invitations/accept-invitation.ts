import { NotifyAcceptInvitationData } from '@apiteam/mailman'
import { InvitationDecodedToken, SafeUser, TeamRole } from '@apiteam/types'
import { Team, Scope, Membership } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import { createMembership } from 'src/helpers'
import {
  deleteInvitationRedis,
  setInvitationRedis,
} from 'src/helpers/invitations'
import {
  acceptInvitationAudience,
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'
import { getKeyPair } from 'src/services/bearer/bearer'

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

  const [invitation, userRaw] = await Promise.all([
    db.invitation.findUnique({
      where: {
        id: decodedToken?.payload.invitationId,
      },
    }),
    coreCacheReadRedis.get(
      `user__email:${decodedToken.payload.invitationEmail}`
    ),
  ])

  if (!userRaw) {
    throw new ServiceValidationError('User not found')
  }

  const user = (userRaw ? JSON.parse(userRaw) : null) as SafeUser

  console.log(invitation, user)

  if (!invitation) {
    throw new ServiceValidationError(
      'Invitation not found, it may have been deleted, declined or already accepted'
    )
  }

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

  Object.entries(allTeamInfo).forEach(([key, value]) => {
    if (key.startsWith('membership:')) {
      const membership = JSON.parse(value) as Membership
      if (membership.role === 'OWNER' || membership.role === 'ADMIN') {
        ownerAdminMemberships.push(membership)
      }
    }
  })

  const ownerAdminUsers = (
    await coreCacheReadRedis.mGet(
      ownerAdminMemberships.map((m) => `user__id:${m.userId}`)
    )
  )
    .filter((u) => u !== null)
    .map((u) => JSON.parse(u as string) as SafeUser)

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
