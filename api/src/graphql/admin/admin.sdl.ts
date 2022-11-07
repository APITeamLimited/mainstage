// Util gql types for react admin
export const schema = gql`
  input PaginationOptions {
    page: Int!
    perPage: Int!
  }

  input SortOptions {
    field: String!
    order: String!
  }
`

/*

Illustration of where addition variables (data) is needed

 interface GetListFields {
    pagination: PaginationOptions
    sort: SortOptions
    filter: JSON
    meta: JSON
  }

  interface GetOneFields {
    id: ID!
    meta: JSON
  }

  interface GetManyFields {
    ids: [ID!]!
    meta: JSON
  }

  interface GetManyReferenceFields {
    target: String!
    id: ID!
    pagination: PaginationOptions
    sort: SortOptions
    filter: JSON
    meta: JSON
  }


  interface CreateNonDataFields {
    meta: JSON
  }

  interface UpdateNonDataFields {
    id: ID!
    meta: JSON
  }

  interface UpdateManyNonDataFields {
    ids: [ID!]!
    meta: JSON
  }

  interface DeleteNonDataFields {
    id: ID!
    meta: JSON
  }

  interface DeleteManyNonDataFields {
    ids: [ID!]!
    meta: JSON
  }

  */
