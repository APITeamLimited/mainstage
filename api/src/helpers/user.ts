import { SafeUser } from '@apiteam/types'
import { User } from '@prisma/client'

import { coreCacheReadRedis } from 'src/lib/redis'

export const setUserRedis = async (user: User) => {
  const safeUser: SafeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isAdmin: user.isAdmin,
    emailVerified: user.emailVerified,
    shortBio: user.shortBio,
    profilePicture: user.profilePicture,
    emailMarketing: user.emailMarketing,
    slug: user.slug,
  }

  await coreCacheReadRedis.set(`user__id:${user.id}`, JSON.stringify(safeUser))

  await coreCacheReadRedis.publish(
    `user__id:${user.id}`,
    JSON.stringify(safeUser)
  )

  await coreCacheReadRedis.set(
    `user__email:${user.email}`,
    JSON.stringify(safeUser)
  )

  await coreCacheReadRedis.publish(
    `user__email:${user.email}`,
    JSON.stringify(safeUser)
  )

  return safeUser
}
