export const schema = gql`
  type AdminUsersResponse {
    data: [User!]!
    total: Int!
    validUntil: DateTime!
  }

  type AdminUserResponse {
    data: User
    validUntil: DateTime!
  }

  type Query {
    adminUserGetOne(id: String!): AdminUserResponse! @requireAuth
    adminUserGetList(page: Int, perPage: Int): AdminUsersResponse! @requireAuth
    adminUserGetMany(ids: [String!]! page: Int, perPage: Int): AdminUsersResponse! @requireAuth
  }
`
