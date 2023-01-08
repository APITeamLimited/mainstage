export const schema = gql`
  type CreditsInfo {
    freeCredits: Int!
    maxFreeCredits: Int!
    paidCredits: Int!
  }

  type Query {
    credits(teamId: String): CreditsInfo! @requireAuth
  }
`
