export const schema = gql`
  enum InvitationRole {
    MEMBER
    ADMIN
  }

  type Invitation {
    id: String!
    createdAt: DateTime!
    updatedAt: DateTime
    email: String!
    teamId: String!
    role: InvitationRole!
  }

  input InvitationInput {
    email: String!
    role: InvitationRole!
  }

  type Query {
    invitations(teamId: String!): [Invitation!]! @requireAuth
  }

  type Mutation {
    createInvitations(
      teamId: String!
      invitations: [InvitationInput!]!
    ): [Invitation!]! @requireAuth
    updateInvitations(
      teamId: String!
      invitations: [InvitationInput!]!
    ): [Invitation!]! @requireAuth
    deleteInvitation(teamId: String!, email: String!): Invitation! @requireAuth
    acceptInvitation(token: String!): Boolean!
    declineInvitation(token: String!): Boolean!
  }
`
