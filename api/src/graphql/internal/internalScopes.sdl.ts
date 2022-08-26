export const schema = gql`
  type Query {
    internalScope(id: String!, internalAPIKey: String!): Scope @skipAuth
  }
`
