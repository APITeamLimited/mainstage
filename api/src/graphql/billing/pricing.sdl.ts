export const schema = gql`
  type PlanInfo {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime
    isActive: Boolean!
    name: String!
    verboseName: String!
    description: String!
    maxMembers: Int!
    maxConcurrentCloudTests: Int!
    monthlyCredits: Int!
    loadZones: [String!]!
    testSchedulingEnabled: Boolean!
    maxTestDurationMinutes: Int!
    dataRetentionMonths: Int!
    maxSimulatedUsers: Int!

    priceMonthlyCents: Int!
    priceYearlyCents: Int!

    freeTrialDays: Int
  }

  type CreditsPricingOption {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime
    isActive: Boolean!
    name: String!
    verboseName: String!
    credits: Int!
    priceCents: Int!
  }

  type Query {
    planInfos: [PlanInfo!]! @skipAuth
    creditsPricingOptions: [CreditsPricingOption!]! @skipAuth
  }
`
