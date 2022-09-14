export const schema = gql`
  type VerifiedDomain {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime
    domain: String!
    variant: ScopeVariant!
    variantTargetId: String!
    txtRecord: String!
    verified: Boolean!
  }

  type Query {
    verifiedDomains(teamId: String): [VerifiedDomain!]! @requireAuth
  }

  type Mutation {
    addVerifiedDomain(domain: String!, teamId: String): VerifiedDomain!
      @requireAuth
    deleteVerifiedDomain(
      verifiedDomainId: String!
      teamId: String
    ): VerifiedDomain! @requireAuth
    performVerification(
      verifiedDomainId: String!
      teamId: String
    ): VerifiedDomain! @requireAuth
  }
`
