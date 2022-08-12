import { Scope } from 'types/graphql'

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await setScopeInRedis(scope)
  )

  return scopes
}

const setScopeInRedis = async (scope: Scope) =>
  await Promise.all(
    Object.entries(scopesReadRedis).map(([key, value]) =>
      scopesReadRedis.HSET(scope.id, key, value)
    )
  )
