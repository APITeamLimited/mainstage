import { Membership } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { coreCacheReadRedis } from 'src/lib/redis'

export const checkOwner = async ({ teamId }: { teamId: string }) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  const currentUserMembership = (
    Object.entries(await coreCacheReadRedis.hGetAll(`team:${teamId}`))
      .filter(([key, _]) => {
        return key.startsWith('membership:')
      })
      .map(([_, value]) => {
        return JSON.parse(value)
      }) as Membership[]
  )
    .filter((membership) => membership.userId === context.currentUser?.id)
    .shift()

  if (!currentUserMembership) {
    throw new ServiceValidationError(
      'You do not have permission to access this resource.'
    )
  }

  if (currentUserMembership.role !== 'OWNER') {
    throw new ServiceValidationError(
      'You need to be an owner to access this resource.'
    )
  }
}
