import { Scope, ScopeVariant } from 'types/graphql'

import { validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { scopesReadRedis } from 'src/lib/redis'

export const scopes = async () => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  if (context.currentUser === undefined || context.currentUser === null) {
    throw 'You must be logged in to access this resource.'
  }

  const scopes = await db.scope.findMany({
    where: {
      userId: context.currentUser.id,
    },
  })

  // If user does not have a scope with variant USER and their userId, create one
  const userScope = scopes.find(
    (scope) =>
      scope.variant === 'USER' &&
      scope.variantTargetId === context.currentUser?.id
  )

  if (!userScope) {
    const newUserScope = await db.scope.create({
      data: {
        userId: context.currentUser.id,
        variant: 'USER',
        variantTargetId: context.currentUser.id,
      },
    })

    scopes.push(newUserScope)
  }

  scopes.forEach(
    async (scope) =>
      // Add to scopes redis
      await setScopeInRedis({
        id: scope.id,
        createdAt: scope.createdAt.toISOString(),
        updatedAt: scope.updatedAt?.toISOString(),
        userId: scope.userId,
        variant: scope.variant as ScopeVariant,
        variantTargetId: scope.variantTargetId,
      })
  )

  return scopes
}

const setScopeInRedis = async (scope: Scope) => {
  console.log('createdAt', scope.createdAt)
  const idPromise = scopesReadRedis.hSet(scope.id, 'id', scope.id)
  const createdAtPromise = scopesReadRedis.hSet(
    scope.id,
    'createdAt',
    scope.createdAt
  )
  const updatedAtPromise = scopesReadRedis.hSet(
    scope.id,
    'updatedAt',
    scope.updatedAt || ''
  )
  const userIdPromise = scopesReadRedis.hSet(scope.id, 'userId', scope.userId)
  const variantPromise = scopesReadRedis.hSet(
    scope.id,
    'variant',
    scope.variant
  )
  const variantTargetIdPromise = scopesReadRedis.hSet(
    scope.id,
    'variantTargetId',
    scope.variantTargetId
  )
  const __typenamePromise = scopesReadRedis.hSet(
    scope.id,
    '__typename',
    'Scope'
  )

  await Promise.all([
    idPromise,
    createdAtPromise,
    updatedAtPromise,
    userIdPromise,
    variantPromise,
    variantTargetIdPromise,
    __typenamePromise,
  ])
}
