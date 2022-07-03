import type {
  QueryResolvers,
  MutationResolvers,
  TeamInvitationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const teamInvitations: QueryResolvers['teamInvitations'] = () => {
  return db.teamInvitation.findMany()
}

export const teamInvitation: QueryResolvers['teamInvitation'] = ({ id }) => {
  return db.teamInvitation.findUnique({
    where: { id },
  })
}

export const createTeamInvitation: MutationResolvers['createTeamInvitation'] =
  ({ input }) => {
    return db.teamInvitation.create({
      data: input,
    })
  }

export const updateTeamInvitation: MutationResolvers['updateTeamInvitation'] =
  ({ id, input }) => {
    return db.teamInvitation.update({
      data: input,
      where: { id },
    })
  }

export const deleteTeamInvitation: MutationResolvers['deleteTeamInvitation'] =
  ({ id }) => {
    return db.teamInvitation.delete({
      where: { id },
    })
  }

export const TeamInvitation: TeamInvitationResolvers = {
  team: (_obj, { root }) =>
    db.teamInvitation.findUnique({ where: { id: root.id } }).team(),
}
