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
    emailMarketing: Boolean
  }

  type Query {
    currentUser: User! @requireAuth
  }

  type Mutation {
    updateCurrentUser(
      firstName: String
      lastName: String
      shortBio: String
      emailMarketing: Boolean
    ): User! @requireAuth
  }
`
