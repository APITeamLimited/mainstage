export const schema = gql`
  enum TeamMembershipRole {
    OWNER
    ADMIN
    MEMBER
  }

  type TeamMembership {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime
    user: User!
    userId: String!
    team: Team!
    teamId: String!
    role: TeamMembershipRole!
  }

  type Query {
    teamMemberships: [TeamMembership!]! @requireAuth
    teamMembership(id: String!): TeamMembership @requireAuth
  }

  input CreateTeamMembershipInput {
    userId: String!
    teamId: String!
    role: TeamMembershipRole!
  }

  input UpdateTeamMembershipInput {
    userId: String
    teamId: String
    role: TeamMembershipRole
  }

  type Mutation {
    createTeamMembership(input: CreateTeamMembershipInput!): TeamMembership!
      @requireAuth
    updateTeamMembership(
      id: String!
      input: UpdateTeamMembershipInput!
    ): TeamMembership! @requireAuth
    deleteTeamMembership(id: String!): TeamMembership! @requireAuth
  }
`
