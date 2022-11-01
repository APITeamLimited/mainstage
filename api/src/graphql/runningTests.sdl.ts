export const schema = gql`
  enum StatusType {
    PENDING
    ASSIGNED
    LOADING
    RUNNING
    FAILURE
    SUCCESS
    COMPLETED_SUCCESS
    COMPLETED_FAILURE
  }

  type RunningTestInfo {
    jobId: ID!
    sourceName: String!
    createdByUserId: ID!
    createdAt: DateTime!
    status: StatusType
  }

  type Query {
    runningTests(teamId: String): [RunningTestInfo!]! @requireAuth
    runningTestsCount(teamId: String): Int! @requireAuth
  }

  type Mutation {
    cancelRunningTest(teamId: String, jobId: String!): Boolean! @requireAuth
  }
`
