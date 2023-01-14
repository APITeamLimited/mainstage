import { z } from 'zod'

import { ServiceValidationError } from '@redwoodjs/api'

import { CreditsPricingOptionModel } from 'src/models'
import { QuoteModel } from 'src/models/billing/quotes'

import { authenticateAndGetContext, getCustomer } from '../helpers'

const numberFormatter = Intl.NumberFormat('en-US', {
  notation: 'compact',
})

const displayCorrectCredits = (credits: number) => {
  // Divide by 1000 to get true value
  const creditsInThousands = credits / 1000

  // Round so no decimals
  const roundedCredits = Math.round(creditsInThousands)

  return numberFormatter.format(roundedCredits)
}

const quantitySchema = z.number().int().min(1).max(100)

export const createCreditsPricingQuote = async ({
  creditsPricingOptionId,
  teamId,
  promotionCode,
  quantity,
}: {
  creditsPricingOptionId: string
  teamId?: string
  promotionCode?: string
  quantity: number
}) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  if (!quantitySchema.safeParse(quantity)) {
    throw new ServiceValidationError(
      `Quantity must be an integer between 1 and 100`
    )
  }

  const creditsPricingOption = await CreditsPricingOptionModel.get(
    creditsPricingOptionId
  ).then((creditsPricingOption) => {
    if (!creditsPricingOption) {
      throw new ServiceValidationError(
        `Credits pricing option with id ${creditsPricingOptionId} not found`
      )
    }

    return creditsPricingOption
  })

  const customer = await getCustomer(workspaceContext)

  // See if there is an existing quote for this credits pricing option
  const quotes = await QuoteModel.getManyFiltered('customer', customer.id)

  const existingQuote = quotes.find(
    (quote) =>
      quote.metadata['creditsPricingOptionId'] === creditsPricingOptionId &&
      quote.status === 'draft'
  )

  const metadata = {
    creditsPricingOptionId,
    promotionCode: promotionCode,
  } as Record<string, string>

  if (promotionCode) {
    metadata['promotionCode'] = promotionCode
  }

  if (existingQuote) {
    return QuoteModel.update(existingQuote.id, {
      description: `${displayCorrectCredits(
        creditsPricingOption.credits * quantity
      )} Credits - ${quantity} x ${creditsPricingOption.name}`,
      lineItems: [
        {
          price: creditsPricingOption.priceId,
          quantity,
        },
      ],
      metadata,
      isSubscription: false,
    })
  }

  return QuoteModel.create({
    customerId: customer.id,
    description: `${displayCorrectCredits(
      creditsPricingOption.credits * quantity
    )} Credits - ${quantity} x ${creditsPricingOption.name}`,
    lineItems: [
      {
        price: creditsPricingOption.priceId,
        quantity,
      },
    ],
    metadata,
    isSubscription: false,
  })
}
