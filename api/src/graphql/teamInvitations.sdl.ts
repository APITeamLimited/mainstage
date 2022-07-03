export const schema = gql`
  type TeamInvitation {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime
    email: String!
    team: Team!
    teamId: String!
    role: String!
  }

  type Query {
    teamInvitations: [TeamInvitation!]! @requireAuth
    teamInvitation(id: String!): TeamInvitation @requireAuth
  }

  input CreateTeamInvitationInput {
    email: String!
    teamId: String!
    role: String!
  }

  input UpdateTeamInvitationInput {
    email: String
    role: String
  }

  type Mutation {
    createTeamInvitation(input: CreateTeamInvitationInput!): TeamInvitation!
      @requireAuth
    updateTeamInvitation(
      id: String!
      input: UpdateTeamInvitationInput!
    ): TeamInvitation! @requireAuth
    deleteTeamInvitation(id: String!): TeamInvitation! @requireAuth
  }
`
