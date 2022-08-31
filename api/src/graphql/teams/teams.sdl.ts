export const schema = gql`
  type Team {
    id: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime
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
    createTeam(name: String!, shortBio: String): Team @requireAuth
    updateTeam(id: String!, name: String!, shortBio: String!): Team!
      @requireAuth
  }
`
