export const schema = gql`
  type Query {
    bearer: String! @requireAuth
    publicKey: String! @skipAuth
  }
`
