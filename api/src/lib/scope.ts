import { ensureCorrectType } from '@apiteam/types-commonjs'
import { Scope } from '@prisma/client'

import { db } from '../lib/db'
import { getCoreCacheReadRedis } from '../lib/redis'

export const getScope = async (id: string): Promise<Scope> => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  const scopeRedis = ensureCorrectType(await coreCacheReadRedis.get(id))
  if (scopeRedis) {
    return JSON.parse(scopeRedis) as Scope
  }

  const scopeDb = await db.scope.findFirst({
    where: {
      id,
    },
  })

  if (!scopeDb) {
    throw new Error('Scope not found')
  }

  await coreCacheReadRedis.set(id, JSON.stringify(scopeDb))

  return scopeDb
}
