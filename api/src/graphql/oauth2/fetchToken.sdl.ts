export const schema = gql`
  type Query {
    fetchToken(
      grantType: String!
      code: String!
      accessTokenURL: String!
      clientID: String!
      clientSecret: String!
      redirectURI: String!
      codeVerifier: String
      clientAuthentication: String!
    ): String! @requireAuth
  }
`
