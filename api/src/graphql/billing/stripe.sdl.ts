export const schema = gql`
  type Query {
    publishableKey: String! @requireAuth
  }
`
