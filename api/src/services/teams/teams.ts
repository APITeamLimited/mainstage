import { validateWith } from '@redwoodjs/api'
import { db } from 'src/lib/db'
import type { Prisma } from '@prisma/client'
import { context } from '@redwoodjs/graphql-server'
import { checkValue } from 'src/settings'
import { generateResetToken } from 'src/lib/token'

const markedForDeletionExpiryHours = <number>(
  checkValue('teams.markedForDeletionExpiryHours')
)

//type PrivateTeam = Omit<Prisma.TeamUncheckedUpdateInput, 'markedForDeletionExpiresAt'>

type Team = Prisma.PromiseReturnType<typeof db.team.create>
type PrivateTeam = Omit<Team, 'markedForDeletionExpiresAt'>

export const teams = async () => {
  // Ensure user is member of the team
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

export const team = async ({ id }: Prisma.TeamWhereUniqueInput) => {
  // Ensure user is member of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  return (await db.team.findFirst({
    where: {
      id,
      memberships: {
        some: {
          userId,
        },
      },
    },
  })) as PrivateTeam
}

export const createTeam = async (
  ownerId: string,
  name: string | undefined,
  shortBio: string | undefined
) => {
  const user = await db.user.findUnique({
    where: { id: ownerId },
  })

  validateWith(() => {
    // Check user exists in db
    if (!user) {
      throw `User does not exist with id '${ownerId}'`
    }
  })

  // Shouldn't be needed, but better than ts-ignoring it
  if (!user) {
    throw 'User does not exist'
  }

  const teamName = name || `${user.firstName}'s Team`

  const team = (await db.team.create({
    data: {
      name: teamName,
      shortBio,
    },
  })) as PrivateTeam

  const ownerMembership = await db.teamMembership.create({
    data: {
      team: { connect: { id: team.id } },
      user: { connect: { id: ownerId } },
      role: 'OWNER',
    },
  })

  return { team, ownerMembership }
}

interface UpdateTeamInput extends Prisma.TeamWhereUniqueInput {
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

  const updatedTeam = (await db.team.update({
    where: { id },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  })) as PrivateTeam

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

  return true
}
