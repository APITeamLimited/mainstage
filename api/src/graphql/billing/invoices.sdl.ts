export const schema = gql`
  enum StripeInvoiceStatus {
    draft
    open
    paid
    uncollectible
    void
  }

  type StripeInvoice {
    id: String!
    hosted_invoice_url: String
    status: StripeInvoiceStatus!
    invoice_pdf: String
    next_payment_attempt: DateTime
    number: String!
    total: Int!
    currency: String!
    period_start: DateTime!
    period_end: DateTime!
    created: Int!
    description: String
  }

  type StripeUpcomingInvoice {
    status: StripeInvoiceStatus!
    next_payment_attempt: DateTime
    total: Int!
    currency: String!
    period_start: Int!
    period_end: Int!
    created: Int!
    description: String
    planName: String!
  }

  type Query {
    invoices(teamId: String): [StripeInvoice!]! @requireAuth
    upcomingInvoice(teamId: String): StripeUpcomingInvoice @requireAuth
  }
`
