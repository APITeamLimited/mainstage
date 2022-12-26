import { DeleteMixin } from '@apiteam/types'
import { Scope } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

export const ScopeModel: DeleteMixin<Scope> = {
  delete: async (id) => {
    const scopeDeleted = await db.scope.delete({
      where: {
        id,
      },
    })

    await deleteScopeRedis(scopeDeleted)

    return scopeDeleted
  },
}

const deleteScopeRedis = async (scope: Scope) => {
  await Promise.all([
    coreCacheReadRedis.del(`scope__id:${scope.id}`),
    coreCacheReadRedis.hDel(`scope__userId:${scope.userId}`, scope.id),
    coreCacheReadRedis.publish(`scope__id:${scope.id}`, 'DELETED'),
    coreCacheReadRedis.publish(`scope__userId:${scope.userId}`, 'DELETED'),
  ])
}
