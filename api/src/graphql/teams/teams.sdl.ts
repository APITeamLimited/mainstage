export const schema = gql`
  type Team {
    id: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime
    slug: String!
    shortBio: String
    profilePicture: String
    maxMembers: Int!
    memberships: [Membership!]!
    invitations: [Invitation!]!
  }

  type Query {
    teams: [Team!]! @requireAuth
    team(id: String!): Team @requireAuth
  }

  type Mutation {
    createTeam(name: String!, slug: String!): Team @requireAuth
    updateTeam(
      teamId: String!
      name: String
      slug: String
      shortBio: String
    ): Team! @requireAuth
    sendDeleteTeamEmail(teamId: String!): Boolean! @requireAuth
    handleTeamDelete(token: String!): Boolean! @skipAuth
  }
`
