import { UserAsPersonal } from '@apiteam/types'
import { Membership } from '@prisma/client'
import { url as gravatarUrl } from 'gravatar'

import { coreCacheReadRedis } from 'src/lib/redis'
import { UserModel } from 'src/models/user'

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

  const users = (
    await Promise.all(
      memberships.map((membership) => UserModel.get(membership.userId))
    )
  ).filter((user) => user !== null) as UserAsPersonal[]

  return memberships.map((membership) => {
    const user = users.find((user) => user.id === membership.userId)

    if (user && !user.profilePicture) {
      user.profilePicture = gravatarUrl(user.email, {
        default: 'mp',
      })
    }

    return {
      ...membership,
      user,
    }
  })
}
