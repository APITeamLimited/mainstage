export const schema = gql`
  type Query {
    internalScope(id: String!, cached: Boolean): Scope @skipAuth
  }
`
