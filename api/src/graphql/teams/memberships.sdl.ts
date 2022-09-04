export const schema = gql`
  enum TeamRole {
    OWNER
    ADMIN
    MEMBER
  }

  type Membership {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime
    user: User!
    userId: String!
    team: Team!
    teamId: String!
    role: TeamRole!
  }

  type ChangeOwnerOutput {
    oldOwnerMembership: Membership!
    newOwnerMembership: Membership!
  }

  type Query {
    memberships(teamId: String!): [Membership!]! @requireAuth
  }

  type Mutation {
    removeUserFromTeam(userId: String!, teamId: String!): Membership!
      @requireAuth
    changeUserRole(
      userId: String!
      teamId: String!
      role: TeamRole!
    ): Membership! @requireAuth
    changeTeamOwner(userId: String!, teamId: String!): ChangeOwnerOutput!
      @requireAuth
  }
`
