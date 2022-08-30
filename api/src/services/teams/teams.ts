import type { Prisma } from '@prisma/client'

import { validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { checkValue } from 'src/config'
import { db } from 'src/lib/db'
import { generateResetToken } from 'src/lib/token'

const markedForDeletionExpiryHours = <number>(
  checkValue('teams.markedForDeletionExpiryHours')
)

//type PrivateTeam = Omit<Prisma.TeamUncheckedUpdateInput, 'markedForDeletionExpiresAt'>

type Team = Prisma.PromiseReturnType<typeof db.team.create>
export type PrivateTeam = Omit<Team, 'markedForDeletionExpiresAt'>

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
  return teams as PrivateTeam[]
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
  shortBio,
}: {
  name: string
  shortBio: string | undefined
}) => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  const team = await db.team.create({
    data: {
      name,
      shortBio,
    },
  })

  const ownerMembership = await db.teamMembership.create({
    data: {
      team: { connect: { id: team.id } },
      user: { connect: { id: context.currentUser?.id } },
      role: 'OWNER',
    },
  })

  return { team, ownerMembership }
}

export interface UpdateTeamInput extends Prisma.TeamWhereUniqueInput {
  input: Omit<
    Prisma.TeamUpdateInput,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'profilePicture'
    | 'maxMembers'
    | 'memberships'
    | 'invitations'
    | 'markedForDeletionToken'
    | 'markedForDeletionExpiresAt'
  >
}

export const updateTeam = async ({ id, input }: UpdateTeamInput) => {
  // Ensure user is at least an admin of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const teamPromise = db.team.findUnique({
    where: {
      id,
    },
  })

  const membershipPromise = db.teamMembership.findMany({
    where: {
      teamId: id,
      userId,
      role: {
        in: ['OWNER', 'ADMIN'],
      },
    },
  })

  const [team, membership] = await Promise.all([teamPromise, membershipPromise])

  validateWith(() => {
    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${id}'`
    }

    // Check user is at least an admin of the team
    if (!membership) {
      throw `You must be an admin or owner of the team to update it`
    }
  })

  // Shouldn't be needed, but better than ts-ignoring it
  if (!team) {
    throw 'Team does not exist'
  }

  if (!membership) {
    throw 'You must be an admin or owner of the team to update it'
  }

  const updatedTeam = await db.team.update({
    where: { id },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  })

  return updatedTeam
}

export const deleteTeam = async ({ id }: Team) => {
  // Ensure user is owner of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const ownerMembershipPromise = db.teamMembership.findFirst({
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
