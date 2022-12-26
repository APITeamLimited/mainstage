import { DeleteMixin } from '@apiteam/types'
import { Membership } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

import { ScopeModel } from './scope'

export const MembershipModel: DeleteMixin<Membership> = {
  delete: async (id) => {
    const membershipDeleted = await db.membership.delete({
      where: {
        id,
      },
    })

    await deleteMembershipRedis(membershipDeleted)

    const scope = await db.scope.findFirst({
      where: {
        variant: 'TEAM',
        variantTargetId: membershipDeleted.id,
      },
      select: {
        id: true,
      },
    })

    if (scope) {
      await ScopeModel.delete(scope.id)
    }

    return membershipDeleted
  },
}

const deleteMembershipRedis = async (membership: Membership) => {
  await Promise.all([
    coreCacheReadRedis.hDel(
      `team:${membership.teamId}`,
      `membership:${membership.id}`
    ),

    coreCacheReadRedis.publish(
      `team:${membership.teamId}`,
      JSON.stringify({
        type: 'REMOVE_MEMBER',
        payload: membership,
      })
    ),
  ])
}
