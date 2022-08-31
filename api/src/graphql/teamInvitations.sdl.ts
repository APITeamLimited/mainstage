export const schema = gql`
  type Invitation {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime
    email: String!
    team: Team!
    teamId: String!
    role: String!
  }

  type Query {
    teamInvitations: [Invitation!]! @requireAuth
    Invitation(id: String!): Invitation @requireAuth
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
    createTeamInvitation(input: CreateTeamInvitationInput!): Invitation!
      @requireAuth
    updateTeamInvitation(
      id: String!
      input: UpdateTeamInvitationInput!
    ): Invitation! @requireAuth
    deleteTeamInvitation(id: String!): Invitation! @requireAuth
  }
`
