export const schema = gql`
  type Query {
    currentPlan(teamId: String): PlanInfo! @requireAuth
    trialEligibility(teamId: String): Boolean! @requireAuth
  }
`
