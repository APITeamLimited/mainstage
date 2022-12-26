export const schema = gql`
  type Mutation {
    getVerificationCode(
      firstName: String!
      email: String!
      recaptchaToken: String!
    ): Boolean @skipAuth
  }
`
