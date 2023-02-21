import { UserAsPersonal } from '@apiteam/types-commonjs'
import { Membership } from '@prisma/client'

import { getCoreCacheReadRedis } from '../../../lib/redis'
import { UserModel } from '../../../models/user'
import { checkOwnerAdmin } from '../../../services/guards'

export const memberships = async ({ teamId }: { teamId: string }) => {
  await checkOwnerAdmin({ teamId })

  // TODO: Only query user field if asked for

  const allTeamInfoRaw = await (
    await getCoreCacheReadRedis()
  ).hGetAll(`team:${teamId}`)

  const memberships = [] as Membership[]

  Object.entries(allTeamInfoRaw).map(([key, value]) => {
    if (key.startsWith('membership:')) {
      memberships.push(JSON.parse(value) as Membership)
    }
  })

  const users = (
    await UserModel.getMany(memberships.map((membership) => membership.userId))
  ).filter((user) => user !== null) as UserAsPersonal[]

  return memberships.map((membership) => {
    const user = users.find((user) => user.id === membership.userId)

    return {
      ...membership,
      user,
    }
  })
}
