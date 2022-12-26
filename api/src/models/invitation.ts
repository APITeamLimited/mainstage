import { DeleteMixin } from '@apiteam/types'
import { Invitation } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

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
