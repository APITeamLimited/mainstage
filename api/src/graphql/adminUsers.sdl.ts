export const schema = gql`
  type Query {
    adminUser(id: String!): User @requireAuth
    adminUsers(page: Int!, perPage: Int!): [User!]! @requireAuth
  }
`
