import { ServiceValidationError } from '@redwoodjs/api'

import { QuoteModel } from '../../../models/billing/quotes'
import { authenticateAndGetContext, getCustomer } from '../helpers'

export const acceptQuote = async ({
  quoteId,
  teamId,
}: {
  quoteId: string
  teamId?: string
}) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const quote = await QuoteModel.get(quoteId).then((quote) => {
    if (!quote) {
      throw new ServiceValidationError(`Quote with id ${quoteId} not found`)
    }

    return quote
  })

  const customer = await getCustomer(workspaceContext)

  if (quote.customer !== customer.id) {
    throw new ServiceValidationError(`Quote with id ${quoteId} not found`)
  }

  if (quote.status !== 'draft') {
    throw new ServiceValidationError(
      `Quote with id ${quoteId} cannot be accepted`
    )
  }

  return QuoteModel.accept(quoteId)
}
