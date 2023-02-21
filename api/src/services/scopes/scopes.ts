import { Scope } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { getCoreCacheReadRedis } from '../../lib/redis'
import { UserModel } from '../../models/user'
import { checkAuthenticated } from '../../services/guards'

/*
Gets all scopes belonging to the current user.
*/
export const scopes = async () => {
  const userId = (await checkAuthenticated()).id

  const user = await UserModel.get(userId)

  if (!user) {
    throw new ServiceValidationError(`User with id ${userId} not found`)
  }

  const rawScopes = await (
    await getCoreCacheReadRedis()
  ).hGetAll(`scope__userId:${user.id}`)

  return Object.values(rawScopes).map(
    (rawScope) => JSON.parse(rawScope) as Scope
  )
}
