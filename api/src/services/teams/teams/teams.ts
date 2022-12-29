import { ServiceValidationError } from '@redwoodjs/api'

import { db } from 'src/lib/db'
import { TeamModel } from 'src/models/team'
import { checkOwnerAdmin, checkAuthenticated } from 'src/services/guards'
import { checkSlugAvailable } from 'src/validators'

export const teams = async () => {
  const userId = (await checkAuthenticated()).id

  const teams = await db.team.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
  })

  return teams
}

/*
Retrieves team info of a team a user is in
*/
export const team = async ({ id }: { id: string }) => {
  const userId = (await checkAuthenticated()).id

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
  const userId = (await checkAuthenticated()).id

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

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new ServiceValidationError('User creating team not found')
  }

  return TeamModel.create({
    name,
    slug,
    owner: user,
  })
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

  return TeamModel.update(teamId, {
    name,
    slug,
    shortBio,
  })
}
