export const schema = gql`
  type Query {
    bearer: String! @requireAuth
    publicBearer(clientID: ID!): String! @requireAuth
    publicKey: String! @skipAuth
  }
`
