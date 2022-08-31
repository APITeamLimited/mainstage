import { User } from '@prisma/client'
import { SafeUser } from 'types/src'

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
  }

  await coreCacheReadRedis.set(`user:${user.id}`, JSON.stringify(safeUser))
  return safeUser
}
