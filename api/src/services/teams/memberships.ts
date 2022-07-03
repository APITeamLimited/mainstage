import { validateWith } from '@redwoodjs/api'
import { db } from 'src/lib/db'

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export const addUserToTeam = async (
  userId: string,
  teamId: string,
  role: TeamRole
) => {
  const userPromise = await db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = await db.team.findUnique({
    where: { id: teamId },
  })

  const teamMembersPromise = db.teamMembership.findMany({
    where: {
      team: { id: teamId },
    },
  })

  const [user, team, teamMembers] = await Promise.all([
    userPromise,
    teamPromise,
    teamMembersPromise,
  ])

  validateWith(async () => {
    // Check user exists in db
    if (!user) {
      throw `User does not exist with id '${userId}'`
    }

    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${teamId}'`
    }

    // Check team has space for new member
    if (teamMembers.length >= team.maxMembers) {
      throw `Team '${team.name}' has reached its maximum capacity of 10 members`
    }

    // Check user is not already a member of the team
    if (teamMembers.find((member) => member.userId === userId)) {
      throw `User with id '${user.id}' is already a member of team '${team.name}'`
    }
  })

  // Create membership
  const membership = await db.teamMembership.create({
    data: {
      team: { connect: { id: teamId } },
      user: { connect: { id: userId } },
      role,
    },
  })

  return membership
}

export const removeUserFromTeam = async (userId: string, teamId: string) => {
  const userPromise = await db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = await db.team.findUnique({
    where: { id: teamId },
  })

  const membershipPromise = db.teamMembership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  const [user, team, membership] = await Promise.all([
    userPromise,
    teamPromise,
    membershipPromise,
  ])

  validateWith(async () => {
    // Check user exists in db
    if (!user) {
      throw `User does not exist with id '${userId}'`
    }

    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${teamId}'`
    }

    // Check user is a member of the team
    if (!membership) {
      throw `User with id '${user.id}' is not a member of team '${team.name}'`
    }

    // Check user is not the owner of the team
    if (membership.role === 'OWNER') {
      throw `User with id '${user.id}' is the owner of team '${team.name}', owner must be changed before removing user`
    }
  })

  // Delete membership
  await db.teamMembership.deleteMany({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })
}

export const changeRole = async (
  userId: string,
  teamId: string,
  role: TeamRole
) => {
  const userPromise = db.user.findUnique({
    where: { id: userId },
  })

  const teamPromise = db.team.findUnique({
    where: { id: teamId },
  })

  const membershipPromise = db.teamMembership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  const [user, team, membership] = await Promise.all([
    userPromise,
    teamPromise,
    membershipPromise,
  ])

  validateWith(async () => {
    // Check user exists in db
    if (!user) {
      throw `User does not exist with id '${userId}'`
    }

    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${teamId}'`
    }

    // Check user is a member of the team
    if (!membership) {
      throw `User with id '${user.id}' is not a member of team '${team.name}'`
    }

    // Check user is not the owner of the team
    if (membership.role === 'OWNER') {
      throw 'Owner role must be changed using changeTeamOwner'
    }

    // Check not trying to change to the same role
    if (membership.role === role) {
      throw `User with id '${user.id}' is already a ${role} of team '${team.name}'`
    }
  })

  // Update membership
  const updatedMembership = await db.teamMembership.updateMany({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
    data: {
      role,
    },
  })

  return updatedMembership
}

export const changeTeamOwner = async (
  newOwnerId: string,
  teamId: string,
  oldOwnerNewRole: 'ADMIN' | 'MEMBER' = 'ADMIN'
) => {
  const newOwnerPromise = db.user.findUnique({
    where: { id: newOwnerId },
  })

  const teamPromise = db.team.findUnique({
    where: { id: teamId },
  })

  const oldOwnerMembershipPromise = await db.teamMembership.findFirst({
    where: {
      team: { id: teamId },
      role: 'OWNER',
    },
  })

  const newOwnerMembershipPromise = db.teamMembership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: newOwnerId },
    },
  })

  const [newOwner, team, newOwnerMembership, oldOwnerMembership] =
    await Promise.all([
      newOwnerPromise,
      teamPromise,
      newOwnerMembershipPromise,
      oldOwnerMembershipPromise,
    ])

  validateWith(async () => {
    // Check user exists in db
    if (!newOwner) {
      throw `New owner does not exist with id '${newOwnerId}'`
    }

    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${teamId}'`
    }

    if (!oldOwnerMembership) {
      throw `Old owner is not a member of team '${team.name}'`
    }

    // Check user is a member of the team
    if (!newOwnerMembership) {
      throw `New owner with id '${newOwner.id}' is not a member of team '${team.name}'`
    }

    // Check user is not the owner of the team
    if (newOwnerMembership.role === 'OWNER') {
      throw `User with id '${newOwner.id}' is already the owner of team '${team.name}'`
    }
  })

  // Shouldn't be needed, but better than ts-ignoring it
  if (!oldOwnerMembership) {
    throw 'Old owner is not a member of team'
  }

  // Shouldn't be needed, but better than ts-ignoring it
  if (!newOwnerMembership) {
    throw 'New owner is not a member of team'
  }

  // Update memberships
  const oldOwnerUpdatePromise = db.teamMembership.update({
    where: {
      id: oldOwnerMembership.id,
    },
    data: {
      role: oldOwnerNewRole,
    },
  })

  const newOwnerUpdatePromise = db.teamMembership.update({
    where: {
      id: newOwnerMembership.id,
    },
    data: {
      role: 'OWNER',
    },
  })

  const [oldOwnerUpdate, newOwnerUpdate] = await Promise.all([
    oldOwnerUpdatePromise,
    newOwnerUpdatePromise,
  ])

  return {
    oldOwner: oldOwnerUpdate,
    newOwner: newOwnerUpdate,
  }
}
