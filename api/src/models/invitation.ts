import { DeleteMixin } from '@apiteam/types-commonjs'
import { Invitation } from '@prisma/client'

import { db } from '../lib/db'
import { getCoreCacheReadRedis } from '../lib/redis'

export const InvitationModel: DeleteMixin<Invitation> = {
  delete: async (id) => {
    const invitationDeleted = await db.invitation.delete({
      where: {
        id,
      },
    })

    await deleteInvitationRedis(invitationDeleted)

    return invitationDeleted
  },
}

export const setInvitationRedis = async (invitation: Invitation) => {
  // Set invitation in redis by id, teamId, and email

  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.sAdd(
      `invitation__teamId:${invitation.teamId}`,
      invitation.id
    ),

    coreCacheReadRedis.sAdd(
      `invitation__email:${invitation.email}`,
      invitation.id
    ),

    coreCacheReadRedis.set(
      `invitation__id:${invitation.id}`,
      JSON.stringify(invitation)
    ),
  ])
}

export const deleteInvitationRedis = async (invitation: Invitation) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.del(`invitation__id:${invitation.id}`),

    coreCacheReadRedis.sRem(
      `invitation__email:${invitation.email}`,
      invitation.id
    ),

    coreCacheReadRedis.sRem(
      `invitation__teamId:${invitation.teamId}`,
      invitation.id
    ),
  ])
}
