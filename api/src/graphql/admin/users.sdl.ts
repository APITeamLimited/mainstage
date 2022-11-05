export const schema = gql`
  type AdminUserCreateInputData {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    isAdmin: Boolean
    emailVerified: Boolean
    shortBio: String
    profilePicture: String
  }

  type AdminUserUpdateInputData {
    firstName: String
    lastName: String
    email: String
    shortBio: String
    emailVerified: Boolean
    profilePicture: String
  }

  type AdminUserGetListInput extends GetListFields

  type AdminUserGetOneInput extends GetOneFields

  type AdminUserGetManyInput extends GetManyFields

  type AdminUserGetManyReferenceInput extends GetManyReferenceInput

  type AdminUserCreateInput extends CreateFieldsNonData {
    data: AdminUserCreateInputData!
  }

  type AdminUserUpdateInput extends UpdateFieldsNonData {
    data: AdminUserUpdateInputData!
    previousData: AdminUserUpdateInputData
  }

  type AdminUserUpdateManyInput extends UpdateManyFieldsNonData {
    data: AdminUserUpdateInputData!
  }

  type AdminUserDeleteInput extends DeleteFieldsNonData

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
    adminUserGetOne(input: AdminUserGetOneInput!): AdminUserGetOneResponse!
    adminUserGetMany(input: AdminUserGetManyInput!): AdminUserGetManyResponse!
    adminUserGetManyReference(
      input: AdminUserGetManyReferenceInput!
    ): AdminUserGetManyReferenceResponse!
  }

  type Mutation {
    adminUserCreate(input: AdminUserCreateInput!): AdminUserCreateResponse!
    adminUserUpdate(input: AdminUserUpdateInput!): AdminUserUpdateResponse!
    adminUserUpdateMany(input: AdminUserUpdateManyInput!): AdminUserUpdateManyResponse!
    adminUserDelete(input: AdminUserDeleteInput!): AdminUserDeleteResponse!
    adminUserDeleteMany(input: AdminUserDeleteManyInput!): AdminUserDeleteManyResponse!
  }
`
