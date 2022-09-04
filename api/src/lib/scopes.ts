import { ensureCorrectType } from '@apiteam/types'
import { Scope } from '@prisma/client'

import { ServiceValidationError, validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { createPersonalScope } from 'src/helpers'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

/*
Gets all scopes belonging to the current user.
*/
export const scopes = async () => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  const user = await db.user.findUnique({
    where: { id: context.currentUser.id },
  })

  if (!user) throw 'Unexpected error, user not found'
  // Personal scope may not exist yet, create if not
  await createPersonalScope(user)

  const rawScopes = await coreCacheReadRedis.hGetAll(`scope__userId:${user.id}`)

  return Object.values(rawScopes).map((rawScope) => {
    return JSON.parse(rawScope) as Scope
  })
}

/*
Gets a single scope by id from cache, must be called by the current user.
*/
export const scope = async ({ id }: { id: string }) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  if (!context?.currentUser?.id) throw 'Unexpected error'

  const redisScopeRaw = ensureCorrectType(
    await coreCacheReadRedis.get(`scope__id:${id}`)
  )
  if (!redisScopeRaw) return null

  const redisScope = JSON.parse(redisScopeRaw) as Scope

  if (redisScope.userId !== context.currentUser.id) return null
  return redisScope
}
