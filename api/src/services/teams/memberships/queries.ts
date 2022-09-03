import { SafeUser } from '@apiteam/types'
import { Membership } from '@prisma/client'

import { coreCacheReadRedis } from 'src/lib/redis'

import { checkOwnerAdmin } from '../validators'

export const memberships = async ({ teamId }: { teamId: string }) => {
  await checkOwnerAdmin({ teamId })

  // TODO: Only query user field if asked for

  const allTeamInfoRaw = await coreCacheReadRedis.hGetAll(`team:${teamId}`)

  const memberships = [] as Membership[]

  Object.entries(allTeamInfoRaw).map(([key, value]) => {
    if (key.startsWith('membership:')) {
      memberships.push(JSON.parse(value) as Membership)
    }
  })

  const usersRaw = await coreCacheReadRedis.mGet(
    memberships.map((membership) => `user__id:${membership.userId}`)
  )

  const users = usersRaw
    .filter((user) => user !== null)
    .map((user) => JSON.parse(user || '') as SafeUser)

  return memberships.map((membership) => {
    const user = users.find((user) => user.id === membership.userId)

    return {
      ...membership,
      user,
    }
  })
}
