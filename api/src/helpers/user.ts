import { SafeUser } from '@apiteam/types'
import { User, Scope } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

import { deleteScope } from './scopes'

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

export const deleteUser = async (user: User) => {
  const scopes = Object.values(
    await coreCacheReadRedis.hGetAll(`scope__userId:${user.id}`)
  ).map((rawScope) => JSON.parse(rawScope) as Scope)
  await Promise.all([
    scopes.map((scope) => deleteScope(scope.id)),
    coreCacheReadRedis.del(`user__id:${user.id}`),
    coreCacheReadRedis.del(`user__email:${user.email}`),
    db.user.delete({
      where: { id: user.id },
    }),
  ])
}
