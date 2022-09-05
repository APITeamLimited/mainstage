import type { Team } from '@prisma/client'

import { ServiceValidationError, validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { checkValue } from 'src/config'
import { createMembership, setTeamScope } from 'src/helpers'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { generateResetToken } from 'src/lib/token'

import { checkOwnerAdmin } from '../validators/check-owner-admin'

const markedForDeletionExpiryHours = <number>(
  checkValue('teams.markedForDeletionExpiryHours')
)

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

  const existingTeamSlugPromise = await db.team.findFirst({
    where: {
      slug,
    },
  })

  const [user, existingTeamSlug] = await Promise.all([
    userPromise,
    existingTeamSlugPromise,
  ])

  if (!user) {
    throw new ServiceValidationError('User creating team not found')
  }

  if (existingTeamSlug) {
    throw new ServiceValidationError('Slug already taken')
  }

  const team = await db.team.create({
    data: {
      name,
      slug,
    },
  })

  const ownerMembership = await createMembership(team, user, 'OWNER')

  const setTeamScopePromise = setTeamScope(team, ownerMembership, user)

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

  await Promise.all([setTeamScopePromise, teamPromise, teamPublishPromise])

  return team
}

export const updateTeam = async ({
  id,
  name,
  slug,
  shortBio,
}: {
  id: string
  name?: string
  slug?: string
  shortBio?: string
}) => {
  validateWith(async () => checkOwnerAdmin({ teamId: id }))

  const team = await db.team.findUnique({
    where: {
      id,
    },
  })

  // Check name one word with only letters and numbers
  if (slug && slug.match(/[^a-z0-9]+/g)) {
    throw new ServiceValidationError(
      'Name must be one word with only lowercase letters and numbers'
    )
  }

  if (name && name.length < 5) {
    throw new ServiceValidationError(
      'Name required and must be at least 5 characters long'
    )
  }

  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${id}'`)
  }

  const updatedTeam = await db.team.update({
    where: { id },
    data: { name, slug, shortBio, updatedAt: new Date() },
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

  return updatedTeam
}

export const deleteTeam = async ({ id }: Team) => {
  // Ensure user is owner of the team
  if (!context.currentUser) {
    throw new Error('You must be logged in to access this resource.')
  }

  throw 'Not implemented'

  const userId = context.currentUser.id

  const ownerMembershipPromise = db.membership.findFirst({
    where: {
      teamId: id,
      userId,
      role: 'OWNER',
    },
  })

  const teamPromise = await db.team.findUnique({
    where: { id: id },
  })

  const [ownerMembership, team] = await Promise.all([
    ownerMembershipPromise,
    teamPromise,
  ])

  validateWith(() => {
    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${id}'`
    }

    // Check user is owner of the team
    if (!ownerMembership) {
      throw `User with id '${userId}' is not owner of team with id '${id}'`
    }
  })

  // Mark for deletion
  await db.team.update({
    where: { id },
    data: {
      markedForDeletionToken: generateResetToken(),
      markedForDeletionExpiresAt: new Date(
        Date.now() + markedForDeletionExpiryHours * 60 * 60 * 1000
      ),
    },
  })

  // TODO: send email

  return true
}
