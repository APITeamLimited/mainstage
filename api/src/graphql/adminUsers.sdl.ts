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
    adminUserGetOne(id: ID!): AdminUserResponse! @requireAuth
    adminUserGetList(page: Int, perPage: Int): AdminUsersResponse! @requireAuth
    adminUserGetMany(ids: [ID!]!, page: Int, perPage: Int): AdminUsersResponse!
      @requireAuth
  }
`
