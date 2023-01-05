export const schema = gql`
  type Query {
    currentPlan(teamId: String): PlanInfo! @requireAuth
  }
`
