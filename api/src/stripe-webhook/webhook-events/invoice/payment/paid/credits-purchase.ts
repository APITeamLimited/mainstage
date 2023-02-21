import type Stripe from 'stripe'

import { getCreditsReadRedis } from '../../../../../lib/redis'
import { CreditsPricingOptionModel } from '../../../../../models'
import { QuoteModel } from '../../../../../models/billing/quotes'

export const checkForCreditsPurchase = async (
  invoice: Stripe.Invoice,
  variant: 'TEAM' | 'USER',
  variantTargetId: string
) => {
  if (!invoice.quote) {
    return
  }

  const quote =
    typeof invoice.quote === 'string'
      ? await QuoteModel.get(invoice.quote).then((quote) => {
          if (!quote) {
            throw new Error(`Quote not found: ${invoice.quote}`)
          }
          return quote
        })
      : invoice.quote

  if (!quote.metadata['creditsPricingOptionId']) {
    return
  }

  const creditsUnitAmount = await CreditsPricingOptionModel.get(
    quote.metadata['creditsPricingOptionId']
  ).then((creditsPricingOption) => {
    if (!creditsPricingOption) {
      throw new Error(
        `Credits pricing option not found: ${quote.metadata['creditsPricingOptionId']}`
      )
    }
    return creditsPricingOption.credits
  })

  const quantity = invoice.lines.data.reduce(
    (acc, lineItem) => acc + (lineItem.quantity ?? 0),
    0
  )

  const creditsReadRedis = await getCreditsReadRedis()

  // Increment credits by the amount purchased

  await creditsReadRedis.incrBy(
    `${variant}:${variantTargetId}:paidCredits`,
    quantity * creditsUnitAmount
  )
}
