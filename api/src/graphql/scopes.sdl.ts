export const schema = gql`
  enum ScopeVariant {
    USER
    TEAM_VIEWER
    TEAM_CREATOR
    TEAM_ADMIN
    TEAM_BILLING
    TEAM_OWNER
  }

  type Scope {
    id: String!
    variant: ScopeVariant!
    variantTargetId: String!
    createdAt: DateTime!
    updatedAt: DateTime
    userId: String!
  }

  type Query {
    scope(id: String!): Scope @requireAuth
  }

  input CreateScopeInput {
    userId: String!
    variant: ScopeVariant!
    variantTargetId: String!
  }

  input UpdateScopeInput {
    userId: String
    variant: ScopeVariant
    variantTargetId: String
  }

  type Query {
    scopes: [Scope!]! @requireAuth
  }
`
