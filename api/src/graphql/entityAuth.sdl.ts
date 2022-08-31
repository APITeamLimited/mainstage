export const schema = gql`
  type Query {
    bearer: String! @requireAuth
    publicBearer(clientID: ID!, scopeId: String!): String! @requireAuth
    publicKey: String! @skipAuth
  }
`
