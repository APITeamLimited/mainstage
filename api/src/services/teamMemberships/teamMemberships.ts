import type {
  QueryResolvers,
  MutationResolvers,
  TeamMembershipResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const teamMemberships: QueryResolvers['teamMemberships'] = () => {
  return db.teamMembership.findMany()
}

export const teamMembership: QueryResolvers['teamMembership'] = ({ id }) => {
  return db.teamMembership.findUnique({
    where: { id },
  })
}

export const createTeamMembership: MutationResolvers['createTeamMembership'] =
  ({ input }) => {
    return db.teamMembership.create({
      data: input,
    })
  }

export const updateTeamMembership: MutationResolvers['updateTeamMembership'] =
  ({ id, input }) => {
    return db.teamMembership.update({
      data: input,
      where: { id },
    })
  }

export const deleteTeamMembership: MutationResolvers['deleteTeamMembership'] =
  ({ id }) => {
    return db.teamMembership.delete({
      where: { id },
    })
  }

export const TeamMembership: TeamMembershipResolvers = {
  user: (_obj, { root }) =>
    db.teamMembership.findUnique({ where: { id: root.id } }).user(),
  team: (_obj, { root }) =>
    db.teamMembership.findUnique({ where: { id: root.id } }).team(),
}
