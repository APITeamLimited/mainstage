import { User } from '@prisma/client'

import { ServiceValidationError, validate, validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

export const teamUsers = async ({ teamId }: { teamId: string }) => {
  // Ensure user is member of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const membership = await db.membership.findFirst({
    where: {
      teamId,
      userId,
    },
  })

  validateWith(() => {
    if (!membership) {
      throw 'You must be a member of this team to access this resource.'
    }
  })

  return await db.user.findMany({
    where: {
      memberships: {
        some: {
          teamId,
        },
      },
    },
  })
}

export const teamUser = async ({
  id,
  teamId,
}: {
  id: string
  teamId: string
}) => {
  // Ensure user is member of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const currentMembership = await db.membership.findFirst({
    where: {
      teamId,
      userId,
    },
  })

  validateWith(() => {
    if (!currentMembership) {
      throw 'You must be a member of this team to access this resource.'
    }
  })

  const user = await db.user.findFirst({
    where: {
      id,
      memberships: {
        some: {
          teamId,
        },
      },
    },
  })

  validateWith(() => {
    if (!user) {
      throw `User does not exist with id '${id}' in team '${teamId}'`
    }
  })

  // Shouldn't be needed, but better than ts-ignoring it
  if (!user) {
    throw `User does not exist with id '${id}' in team '${teamId}'`
  }

  return user
}

export const currentUser = async () => {
  // Ensure logged in
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  const userRedisRaw = await coreCacheReadRedis.get(
    `user__id:${context.currentUser.id}`
  )

  if (userRedisRaw) {
    return JSON.parse(userRedisRaw) as User
  }

  throw new ServiceValidationError(
    'User profile not found. Please log out and log back in.'
  )
}
