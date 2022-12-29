// Auth in handleChangeOwner done via JWT

export const schema = gql`
  enum TeamRole {
    OWNER
    ADMIN
    MEMBER
  }

  enum ChangeRoleInput {
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
    wantsTeamEmails: Boolean!
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
      role: ChangeRoleInput!
    ): Membership! @requireAuth
    sendChangeTeamOwnerEmail(teamId: String!, userId: String!): Boolean!
      @requireAuth
    handleChangeOwner(token: String!): Boolean! @skipAuth
    leaveTeam(teamId: String!): Boolean! @requireAuth
  }
`
