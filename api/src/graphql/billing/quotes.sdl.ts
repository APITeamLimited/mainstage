export const schema = gql`
  type QuoteMetadata {
    promotionCode: String
  }

  enum QuoteStatus {
    draft
    open
    accepted
    canceled
  }

  enum LineItemType {
    invoiceitem
    subscription
  }

  type LineItem {
    id: String!
    amount_discount: Int!
    amount_subtotal: Int!
    amount_tax: Int!
    amount_total: Int!
    currency: String!
    description: String!
    # Proration refers to the process of adjusting the price of a subscription during a billing cycle to account for any price changes, ie when a customer upgrades or downgrades their plan.
    proration: Boolean!
    quantity: Int!
    type: LineItemType!
  }

  type Quote {
    id: String!
    metadata: QuoteMetadata
    status: QuoteStatus!
    line_items: [LineItem!]!
    amount_subtotal: Int!
    amount_total: Int!
    description: String!
  }

  type AcceptedQuoteResult {
    acceptedQuote: Quote!
    invoice: StripeInvoice!
  }

  enum PricingOption {
    yearly
    monthly
  }

  type Mutation {
    createPlanQuote(
      planId: String!
      pricingOption: PricingOption!
      teamId: String
      promotionCode: String
    ): Quote! @requireAuth
    createCreditsPricingQuote(
      creditsPricingOptionId: String!
      teamId: String
      promotionCode: String
      quantity: Int!
    ): Quote! @requireAuth
    acceptQuote(quoteId: String!, teamId: String): AcceptedQuoteResult!
      @requireAuth
  }
`
