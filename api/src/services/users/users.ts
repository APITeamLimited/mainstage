import { ServiceValidationError } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { checkAuthenticated } from 'src/services/guards'

export const teamUsers = async ({ teamId }: { teamId: string }) => {
  // Ensure user is member of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const membership = await db.membership.findFirst({
    where: {
      teamId,
      userId: context.currentUser.id,
    },
  })

  if (!membership) {
    throw new ServiceValidationError(
      'You must be a member of this team to access this resource.'
    )
  }

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
  const currentMembership = await db.membership.findFirst({
    where: {
      teamId,
      userId: context.currentUser.id,
    },
  })

  if (!currentMembership) {
    throw new ServiceValidationError(
      'You must be a member of this team to access this resource.'
    )
  }

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

  if (!user) {
    throw new ServiceValidationError(
      `User does not exist with id '${id}' in team '${teamId}'`
    )
  }

  return user
}

export const currentUser = checkAuthenticated
