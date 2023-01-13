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
  }

  type Query {
    invoices(teamId: String): [StripeInvoice!]! @requireAuth
  }
`
