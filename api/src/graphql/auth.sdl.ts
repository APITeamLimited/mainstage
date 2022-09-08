export const schema = gql`
  type Mutation {
    getVerificationCode(firstName: String!, email: String!): Boolean @skipAuth
  }
`
