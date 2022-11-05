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
    slug: String!
  }

  fragment AllUserFields on User {
    id
    firstName
    lastName
    email
    createdAt
    updatedAt
    isAdmin
    emailVerified
    shortBio
    profilePicture
    emailMarketing
    slug
  }

  type Query {
    currentUser: User! @requireAuth
  }

  type Mutation {
    updateCurrentUser(
      firstName: String
      lastName: String
      shortBio: String
      slug: String
      emailMarketing: Boolean
    ): User! @requireAuth
    sendAccountDeleteEmail: Boolean! @requireAuth
    handleAccountDelete(token: String!): Boolean! @skipAuth
  }
`
