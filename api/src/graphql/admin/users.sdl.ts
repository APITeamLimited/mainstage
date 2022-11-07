export const schema = gql`
  input AdminUserCreateInputData {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    isAdmin: Boolean
    emailVerified: Boolean
    shortBio: String
    profilePicture: String
  }

  input AdminUserUpdateInputData {
    firstName: String
    lastName: String
    email: String
    shortBio: String
    emailVerified: Boolean
    profilePicture: String
  }

  input AdminUserGetListInput {
    pagination: PaginationOptions
    sort: SortOptions
    filter: JSON
    meta: JSON
  }

  input AdminUserGetOneInput {
    id: ID!
    meta: JSON
  }

  input AdminUserGetManyInput {
    ids: [ID!]!
    meta: JSON
  }

  input AdminUserGetManyReferenceInput {
    target: String!
    id: ID!
    pagination: PaginationOptions
    sort: SortOptions
    filter: JSON
    meta: JSON
  }

  input AdminUserCreateInput {
    meta: JSON
    data: AdminUserCreateInputData!
  }

  input AdminUserUpdateInput {
    id: ID!
    meta: JSON
    data: AdminUserUpdateInputData!
    previousData: AdminUserUpdateInputData
  }

  input AdminUserUpdateManyInput {
    ids: [ID!]!
    meta: JSON
    data: AdminUserUpdateInputData!
  }

  input AdminUserDeleteInput {
    id: ID!
    meta: JSON
  }

  input AdminUserDeleteManyInput {
    ids: [ID!]!
    meta: JSON
  }

  type AdminUserGetListResponse {
    data: [User!]!
    total: Int!
  }

  type AdminUserGetOneResponse {
    data: User
  }

  type AdminUserGetManyResponse {
    data: [User!]!
  }

  type AdminUserGetManyReferenceResponse {
    data: [User!]!
    total: Int!
  }

  type AdminUserCreateResponse {
    data: User!
  }

  type AdminUserUpdateResponse {
    data: User!
  }

  type AdminUserUpdateManyResponse {
    data: [ID!]!
  }

  type AdminUserDeleteResponse {
    data: User!
  }

  type AdminUserDeleteManyResponse {
    data: [ID!]!
  }

  type Query {
    adminUserGetList(input: AdminUserGetListInput!): AdminUserGetListResponse!
      @requireAuth
    adminUserGetOne(input: AdminUserGetOneInput!): AdminUserGetOneResponse!
      @requireAuth
    adminUserGetMany(input: AdminUserGetManyInput!): AdminUserGetManyResponse!
      @requireAuth
    adminUserGetManyReference(
      input: AdminUserGetManyReferenceInput!
    ): AdminUserGetManyReferenceResponse! @requireAuth
  }

  type Mutation {
    adminUserCreate(input: AdminUserCreateInput!): AdminUserCreateResponse!
      @requireAuth
    adminUserUpdate(input: AdminUserUpdateInput!): AdminUserUpdateResponse!
      @requireAuth
    adminUserUpdateMany(
      input: AdminUserUpdateManyInput!
    ): AdminUserUpdateManyResponse! @requireAuth
    adminUserDelete(input: AdminUserDeleteInput!): AdminUserDeleteResponse!
      @requireAuth
    adminUserDeleteMany(
      input: AdminUserDeleteManyInput!
    ): AdminUserDeleteManyResponse! @requireAuth
  }
`
