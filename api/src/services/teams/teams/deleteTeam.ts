import { ConfirmTeamDeleteData } from '@apiteam/mailman'
import { Team } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import {
  deleteTeamAudience,
  generateBlanketUnsubscribeUrl,
  generateDeleteTeamUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'
import { TeamModel } from 'src/models/team'
import { getKeyPair } from 'src/services/bearer/bearer'

import { checkOwner } from 'src/services/guards'

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

  await checkOwner({ teamId: decodedToken.payload.teamId })

  await TeamModel.delete(decodedToken.payload.teamId)

  return true
}
