import { Invitation } from '@prisma/client'

import { coreCacheReadRedis } from 'src/lib/redis'

export const setInvitationRedis = async (invitation: Invitation) => {
  // Set invitation in redis by id, teamId, and email

  const teamIdPromise = coreCacheReadRedis.sAdd(
    `invitation__teamId:${invitation.teamId}`,
    invitation.id
  )

  const emailPromise = coreCacheReadRedis.sAdd(
    `invitation__email:${invitation.email}`,
    invitation.id
  )

  const idPromise = coreCacheReadRedis.set(
    `invitation__id:${invitation.id}`,
    JSON.stringify(invitation)
  )

  await Promise.all([teamIdPromise, emailPromise, idPromise])
}

export const deleteInvitationRedis = async (invitation: Invitation) => {
  const redisDeletePromiseId = coreCacheReadRedis.del(
    `invitation__id:${invitation.id}`
  )
  const redisDeletePromiseEmail = coreCacheReadRedis.sRem(
    `invitation__email:${invitation.email}`,
    invitation.id
  )
  const redisDeletePromiseTeamId = coreCacheReadRedis.sRem(
    `invitation__teamId:${invitation.teamId}`,
    invitation.id
  )

  await Promise.all([
    redisDeletePromiseId,
    redisDeletePromiseEmail,
    redisDeletePromiseTeamId,
  ])
}
