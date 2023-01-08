export const schema = gql`
  enum ScopeVariant {
    USER
    TEAM
  }

  enum ScopeRole {
    OWNER
    ADMIN
    MEMBER
  }

  type Scope {
    id: String!
    variant: ScopeVariant!
    variantTargetId: String!
    role: ScopeRole
    createdAt: DateTime!
    updatedAt: DateTime
    userId: String!
    displayName: String!
    profilePicture: String
    slug: String!
    planName: String!
  }

  type Query {
    scope(id: String!): Scope @requireAuth
  }

  type Query {
    scopes: [Scope!]! @requireAuth
  }
`
