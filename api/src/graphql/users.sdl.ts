export const schema = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    createdAt: DateTime!
    updatedAt: DateTime
    isAdmin: Boolean!
    emailVerified: Boolean!
    shortBio: String
    profilePicture: String
    memberships: [Membership!]!
  }

  type Query {
    teamUsers(teamId: String!): [User!]! @requireAuth
    teamUser(id: String!, teamId: String!): User! @requireAuth
    currentUser: User! @requireAuth
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    shortBio: String
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    email: String
    shortBio: String
  }

  type Mutation {
    updateCurrentUser(input: UpdateUserInput!): User @requireAuth
  }
`
