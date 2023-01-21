export const schema = gql`
  enum SetupIntentStatus {
    canceled
    processing
    requires_action
    requires_confirmation
    requires_payment_method
    succeeded
  }

  type SetupIntentResponse {
    id: String!
    client_secret: String!
    status: SetupIntentStatus!
  }

  type Query {
    setupIntents(teamId: String): [SetupIntentResponse!]! @requireAuth
    setupIntent(teamId: String, setupIntentId: String!): SetupIntentResponse!
      @requireAuth
  }

  type Mutation {
    createOrUpdateSetupIntent(
      teamId: String
      paymentMethodId: String!
    ): SetupIntentResponse! @requireAuth
  }
`
