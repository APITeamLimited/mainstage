import { SafeUser } from '@apiteam/types'
import { Scope } from '@prisma/client'
import { url as gravatarUrl } from 'gravatar'

import { ServiceValidationError } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

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

  const userRaw = await coreCacheReadRedis.get(
    `user__id:${context.currentUser.id}`
  )

  if (!userRaw) {
    throw new ServiceValidationError('User not found')
  }

  const user = JSON.parse(userRaw) as SafeUser

  const rawScopes = await coreCacheReadRedis.hGetAll(`scope__userId:${user.id}`)

  return Object.values(rawScopes).map((rawScope) => {
    const scope = JSON.parse(rawScope) as Scope

    return determineGravatar(scope, user.email)
  })
}

const determineGravatar = (scope: Scope, email: string) => {
  if (scope.variant === 'USER') {
    return {
      ...scope,
      profilePicture: gravatarUrl(email, {
        default: 'mp',
      }),
    }
  }

  return scope
}
