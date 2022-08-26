import { Scope } from '@prisma/client'

import { db } from 'src/lib/db'
import { scopesReadRedis } from 'src/lib/redis'

export const getScope = async (id: string): Promise<Scope> => {
  const scopeRedis = await scopesReadRedis.get(id)
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

  await scopesReadRedis.set(id, JSON.stringify(scopeDb))

  return scopeDb
}
