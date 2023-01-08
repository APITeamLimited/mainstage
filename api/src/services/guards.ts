import { Membership } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import { coreCacheReadRedis } from 'src/lib/redis'

export const checkOwner = async ({ teamId }: { teamId: string }) => {
  const currentUser = await checkAuthenticated()

  const currentUserMembership = (
    Object.entries(await coreCacheReadRedis.hGetAll(`team:${teamId}`))
      .filter(([key, _]) => {
        return key.startsWith('membership:')
      })
      .map(([_, value]) => {
        return JSON.parse(value)
      }) as Membership[]
  )
    .filter((membership) => membership.userId === currentUser.id)
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

export const checkOwnerAdmin = async ({
  teamId,
}: {
  teamId: string | undefined
}) => {
  const currentUser = await checkAuthenticated()

  const currentUserMembership = (
    Object.entries(await coreCacheReadRedis.hGetAll(`team:${teamId}`))
      .filter(([key, _]) => {
        return key.startsWith('membership:')
      })
      .map(([_, value]) => {
        return JSON.parse(value)
      }) as Membership[]
  )
    .filter((membership) => membership.userId === currentUser.id)
    .shift()

  if (!currentUserMembership) {
    throw new ServiceValidationError(
      'You do not have permission to access this resource.'
    )
  }

  if (
    currentUserMembership.role !== 'OWNER' &&
    currentUserMembership.role !== 'ADMIN'
  ) {
    throw new ServiceValidationError(
      'You need to be an owner or admin to access this resource.'
    )
  }

  return currentUserMembership.role
}
export const checkMember = async ({
  teamId,
}: {
  teamId: string | undefined
}) => {
  const currentUser = await checkAuthenticated()

  const currentUserMembership = (
    Object.entries(await coreCacheReadRedis.hGetAll(`team:${teamId}`))
      .filter(([key, _]) => {
        return key.startsWith('membership:')
      })
      .map(([_, value]) => {
        return JSON.parse(value)
      }) as Membership[]
  )
    .filter((membership) => membership.userId === currentUser.id)
    .shift()

  if (!currentUserMembership) {
    throw new ServiceValidationError(
      'You do not have permission to access this resource.'
    )
  }

  return currentUserMembership
}

export const checkAuthenticated = async () => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  return context.currentUser
}

/**
 * Checks a user is an APITeam admin.
 */
export const checkAPITeamAdmin = async () => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  if (!context.currentUser.isAdmin) {
    throw new ServiceValidationError(
      'You must be an admin to access this resource.'
    )
  }
}

const INTERNAL_API_KEY = checkValue<string>('api.internalAPIKey')

export const checkInternal = (internalAPIKey: string) => {
  if (internalAPIKey !== INTERNAL_API_KEY) {
    throw new Error('Invalid internal API key')
  }
}
