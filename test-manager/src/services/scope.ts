import { Scope } from '@prisma/client'

import { getCoreCacheReadRedis } from '../redis'

export const findScope = async (id: string): Promise<Scope | null> => {
  const rawScope = await (await getCoreCacheReadRedis()).get(`scope__id:${id}`)
  if (!rawScope) return null
  return JSON.parse(rawScope) as Scope
}
