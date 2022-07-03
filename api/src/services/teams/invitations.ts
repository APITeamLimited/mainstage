import { validate, validateWith } from '@redwoodjs/api'
import { db } from 'src/lib/db'
import { TeamRole } from './memberships'

export const inviteUserToTeam = async (
  email: string,
  teamId: string,
  role: TeamRole = 'MEMBER'
) => {
  // Check email is valid
  validate(email, 'Email Address', {
    email: true,
  })

  const teamPromise = await db.team.findUnique({
    where: { id: teamId },
  })

  const teamMembersPromise = db.teamMembership.findMany({
    where: {
      team: { id: teamId },
    },
  })

  const emailUserPromise = db.user.findUnique({
    where: { email },
  })

  const existingInvitationPromise = db.teamInvitation.findFirst({
    where: {
      team: { id: teamId },
      email,
    },
  })

  const [team, teamMembers, emailUser, existingInvitation] = await Promise.all([
    teamPromise,
    teamMembersPromise,
    emailUserPromise,
    existingInvitationPromise
  ])

  validateWith(() => {
    // Check team exists in db
    if (!team) {
      throw `Team does not exist with id '${teamId}'`
    }

    // Check email is not already a member of the team
    if (emailUser) {
      const indexMember = teamMembers.find((member) => member.userId === emailUser.id)
      if (indexMember) {
        throw `User with email '${email}' is already a member of team '${team.name}'`
      }
    }

    // Check email is not already invited to the team
    if (existingInvitation) {
      throw `User with email '${email}' is already invited to team '${team.name}'`
    }

    // Check team has space for new member
    if (teamMembers.length >= team.maxMembers) {
      throw `Team '${team.name}' has reached its maximum capacity of ${team.maxMembers} members`
    }
  })

  // Create invitation
  const invitation = await db.teamInvitation.create({
    data: {
      team: { connect: { id: teamId } },
      email,
      role,
    },
  })

  return invitation
}
