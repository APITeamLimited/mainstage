import { Team } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { createMembership, createTeamScope } from 'src/helpers'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { checkSlugAvailable } from 'src/validators/slug'

import { checkOwnerAdmin } from '../validators/check-owner-admin'

export const teams = async () => {
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const teams = await db.team.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
  })

  // Remove markedForDeletionToken from each team object
  return teams
}

/*
Retrieves team info of a team a user is in
*/
export const team = async ({ id }: { id: string }) => {
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  return await db.team.findFirst({
    where: {
      id,
      memberships: {
        some: {
          userId,
        },
      },
    },
  })
}
export const createTeam = async ({
  name,
  slug,
}: {
  name: string
  slug: string
}) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  // Check name not empty and length at least 5 chars
  if (!name || name.length < 5) {
    throw new ServiceValidationError(
      'Name required and must be at least 5 characters long'
    )
  }

  // Check slug one word with only letters and numbers
  if (slug.match(/[^a-z0-9]+/g)) {
    throw new ServiceValidationError(
      'Slug must be one word with only lowercase letters and numbers'
    )
  }

  const userPromise = db.user.findUnique({
    where: { id: context.currentUser.id },
  })

  const existingSlugPromise = await checkSlugAvailable(slug)

  const [user] = await Promise.all([userPromise, existingSlugPromise])

  if (!user) {
    throw new ServiceValidationError('User creating team not found')
  }

  const team = await db.team.create({
    data: {
      name,
      slug,
    },
  })

  await createMembership(team, user, 'OWNER')

  // Set in core cache
  const teamPromise = coreCacheReadRedis.hSet(
    `team:${team.id}`,
    'team',
    JSON.stringify(team)
  )

  const teamPublishPromise = coreCacheReadRedis.publish(
    `team:${team.id}`,
    JSON.stringify({
      type: 'CREATE',
      payload: team,
    })
  )

  await Promise.all([teamPromise, teamPublishPromise])

  return team
}

export const updateTeam = async ({
  teamId,
  name,
  slug,
  shortBio,
}: {
  teamId: string
  name?: string
  slug?: string
  shortBio?: string
}) => {
  await checkOwnerAdmin({ teamId })

  const team = await db.team.findUnique({
    where: {
      id: teamId,
    },
  })

  if (!team) {
    throw new Error('Team not found')
  }

  // Check name one word with only letters and numbers
  if (slug) {
    if (slug.length < 5) {
      throw new ServiceValidationError(
        'Slug must be at least 5 characters long'
      )
    }

    // Ensure name is only alphanumeric no spaces
    if (slug.match(/[^a-z0-9]+/g)) {
      throw new ServiceValidationError(
        'Slug must be one word with only lowercase letters and numbers'
      )
    }

    if (slug === team.slug) {
      throw new ServiceValidationError('Slug must be new')
    }

    await checkSlugAvailable(slug)
  }

  if (name) {
    if (name.length < 5) {
      throw new ServiceValidationError(
        'Name must be at least 5 characters long'
      )
    }

    // Ensure name is only alphanumeric and spaces
    if (!name.match(/^[a-zA-Z0-9 ]+$/)) {
      throw new ServiceValidationError(
        'Name must be alphanumeric and spaces only'
      )
    }

    if (name === team.name) {
      throw new ServiceValidationError('Name must be new')
    }
  }

  const updatedTeam = await db.team.update({
    where: { id: teamId },
    data: { name, slug, shortBio },
  })

  // Set in core cache
  const teamPromise = coreCacheReadRedis.hSet(
    `team:${updatedTeam.id}`,
    'team',
    JSON.stringify(updatedTeam)
  )

  const teamPublishPromise = coreCacheReadRedis.publish(
    `team:${updatedTeam.id}`,
    JSON.stringify({
      type: 'UPDATE',
      payload: updatedTeam,
    })
  )

  await Promise.all([teamPromise, teamPublishPromise])

  const memberships = await db.membership.findMany({
    where: {
      teamId,
    },
  })

  const userIds = memberships.map((m) => m.userId)

  const users = await db.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  })

  // Call createTeamScope for each scope
  await Promise.all(
    memberships.map(async (membership) => {
      const user = users.find((u) => u.id === membership.userId)

      if (!user) {
        throw new Error(`User not found with id '${membership.userId}'`)
      }

      if (!updatedTeam) {
        throw new Error('Failed to update team')
      }

      return createTeamScope(updatedTeam, membership, user)
    })
  )

  return updatedTeam
}
