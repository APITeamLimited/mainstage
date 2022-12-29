import { Scope } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { coreCacheReadRedis } from 'src/lib/redis'
import { UserModel } from 'src/models/user'
import { checkAuthenticated } from 'src/services/guards'

/*
Gets all scopes belonging to the current user.
*/
export const scopes = async () => {
  const userId = (await checkAuthenticated()).id

  const user = await UserModel.get(userId)

  if (!user) {
    throw new ServiceValidationError(`User with id ${userId} not found`)
  }

  const rawScopes = await coreCacheReadRedis.hGetAll(`scope__userId:${user.id}`)

  return Object.values(rawScopes).map(
    (rawScope) => JSON.parse(rawScope) as Scope
  )
}
