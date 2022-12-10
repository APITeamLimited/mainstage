export const schema = gql`
  type Query {
    apiTeamOAuth2Result(apiteamOAuth2Code: String!): String @requireAuth # ApiteamOAuth2Callback | null
  }

  type Mutation {
    createAPITeamOAuth2Code: String! @requireAuth # apiteamOAuth2Code (uuid)
  }
`
