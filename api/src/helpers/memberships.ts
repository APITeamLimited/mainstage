import { TeamRole } from '@apiteam/types'
import { User, Team, Membership } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

/*
Creates a membership to a team and broadcasts to coreCache
*/
export const createMembership = async (
  team: Team,
  user: User,
  role: TeamRole
): Promise<Membership> => {
  // Create membership
  const membership = await db.membership.create({
    data: {
      team: { connect: { id: team.id } },
      user: { connect: { id: user.id } },
      role,
    },
  })

  const setPromise = coreCacheReadRedis.hSet(
    `team:${team.id}`,
    `membership:${membership.id}`,
    JSON.stringify(membership)
  )

  const publishPromise = coreCacheReadRedis.publish(
    `team:${team.id}`,
    JSON.stringify({
      type: 'ADD_MEMBER',
      payload: membership,
    })
  )

  await Promise.all([setPromise, publishPromise])

  return membership
}
