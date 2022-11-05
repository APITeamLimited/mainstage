
// Util gql types for react admin
export const schema = gql`
  type PaginationOptions {
    page: Int!
    perPage: Int!
  }

  type SortOptions {
    field: String!
    order: String!
  }

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

  interface CreateFieldsNonData {
    meta: JSON
  }

  interface UpdateFieldsNonData {
    id: ID!
    meta: JSON
  }

  interface UpdateManyFieldsNonData {
    ids: [ID!]!
    meta: JSON
  }

  interface DeleteFieldsNonData {
    id: ID!
    meta: JSON
  }

  interface DeleteManyFieldsNonData {
    ids: [ID!]!
    meta: JSON
  }
`

/*

Illustration of where addition variables (data) is needed

 fragment GetListFields on Admin {
    pagination: PaginationOptions
    sort: SortOptions
    filter: JSON
    meta: JSON
  }

  fragment GetOneFields on Admin {
    id: ID!
    meta: JSON
  }

  fragment GetManyFields on Admin {
    ids: [ID!]!
    meta: JSON
  }

  fragment GetManyReferenceFields on Admin {
    target: String!
    id: ID!
    pagination: PaginationOptions
    sort: SortOptions
    filter: JSON
    meta: JSON
  }

  fragment CreateFieldsNonData on Admin {
    // Data
    meta: JSON
  }

  fragment UpdateFieldsNonData on Admin {
    id: ID!
    meta: JSON
    // Data
    // Previous data
  }

  fragment UpdateManyFieldsNonData on Admin {
    ids: [ID!]!
    meta: JSON
    // Data
  }

  fragment DeleteFieldsNonData on Admin {
    id: ID!
    // Previous data
    meta: JSON
  }

  fragment DeleteManyFields on Admin {
    ids: [ID!]!
    meta: JSON
  }

  */