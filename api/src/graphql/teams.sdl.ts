export const schema = gql`
  type Team {
    id: String!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime
    shortBio: String
    profilePicture: String
    maxMembers: Int!
    memberships: [TeamMembership]!
    invitations: [TeamInvitation]!
  }

  type Query {
    teams: [Team!]! @requireAuth
    team(id: String!): Team @requireAuth
  }

  input CreateTeamInput {
    name: String!
    shortBio: String
  }

  input UpdateTeamInput {
    name: String
    shortBio: String
  }

  type Mutation {
    createTeam(input: CreateTeamInput!): Team! @requireAuth
    updateTeam(id: String!, input: UpdateTeamInput!): Team! @requireAuth
    deleteTeam(id: String!): Boolean! @requireAuth
  }
`
