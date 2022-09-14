import { ConfirmTeamDeleteData, NotifyTeamDeletedData } from '@apiteam/mailman'
import { SafeUser } from '@apiteam/types'
import { Team } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import { deleteMembership } from 'src/helpers'
import {
  deleteTeamAudience,
  generateBlanketUnsubscribeUrl,
  generateDeleteTeamUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'
import { getKeyPair } from 'src/services/bearer/bearer'

import { checkOwner } from '../validators'

const issuer = checkValue<string>('api.bearer.issuer')

export const sendDeleteTeamEmail = async ({ teamId }: { teamId: string }) => {
  await checkOwner({ teamId })

  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  const teamRaw = await coreCacheReadRedis.hGet(`team:${teamId}`, 'team')
  if (!teamRaw) {
    throw new Error('Team not found')
  }
  const team = JSON.parse(teamRaw) as Team

  console.log('team', team)

  await dispatchEmail({
    to: context.currentUser.email,
    template: 'confirm-team-delete',
    data: {
      teamName: team.name,
      deleteLink: await generateDeleteTeamUrl(teamId, team.name),
      targetName: context.currentUser.firstName,
    } as ConfirmTeamDeleteData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(context.currentUser),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
      context.currentUser.email
    ),
  })

  return true
}

export const handleTeamDelete = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken:
    | (JWT.Jwt & {
        payload: JWT.JwtPayload & {
          teamId: string
          teamName: string
        }
      })
    | undefined = undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: deleteTeamAudience,
      complete: true,
    }) as JWT.Jwt & {
      payload: JWT.JwtPayload & {
        teamId: string
        teamName: string
      }
    }
  } catch (error) {
    throw new ServiceValidationError('Invalid token')
  }

  if (!decodedToken.payload.teamId || !decodedToken.payload.teamName) {
    throw new ServiceValidationError('Invalid token')
  }

  const teamId = decodedToken.payload.teamId
  const teamName = decodedToken.payload.teamName

  await checkOwner({ teamId })

  // Delete in reverse order of creation

  const invitations = await db.invitation.findMany({
    where: {
      teamId,
    },
  })

  await Promise.all([
    coreCacheReadRedis.del(`invitation__teamId:${teamId}`),
    ...invitations.map((invitation) =>
      coreCacheReadRedis.del(`invitation__id:${invitation.id}`)
    ),
    ...invitations.map((invitation) =>
      coreCacheReadRedis.sRem(
        `invitation__email:${invitation.email}`,
        invitation.email
      )
    ),
    db.invitation.deleteMany({
      where: {
        teamId,
      },
    }),
  ])

  const memberships = await db.membership.findMany({
    where: {
      teamId,
    },
  })

  const userMemberships = (
    memberships.length > 0
      ? await coreCacheReadRedis.mGet(
          memberships.map((membership) => `user__id:${membership.userId}`)
        )
      : []
  )
    .filter((user) => user)
    .map((user) => JSON.parse(user || '') as SafeUser)

  await Promise.all([
    // Notify all members of team deletion
    userMemberships.map(async (user) =>
      dispatchEmail({
        to: user.email,
        template: 'notify-team-deleted',
        data: {
          teamName,
          targetName: user.firstName,
          wasOwner: user.id === context.currentUser?.id,
        } as NotifyTeamDeletedData,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
      })
    ),
    // Delete all memberships
    ...memberships.map(deleteMembership),
    // Delete team
    coreCacheReadRedis.del(`team:${teamId}`),
    // Broadcast team deletion to other services
    coreCacheReadRedis.publish('TEAM_DELETED', teamId),
  ])

  return true
}
