import { ServiceValidationError } from '@redwoodjs/api'

import { PlanInfoModel } from 'src/models'
import { QuoteModel } from 'src/models/billing/quotes'
import { SubscriptionModel } from 'src/models/billing/subscription'

import { authenticateAndGetContext, getCustomer } from '../helpers'
import { trialEligibility } from '../trial-status'

export const createPlanQuote = async ({
  planId,
  pricingOption,
  teamId,
  promotionCode,
}: {
  planId: string
  pricingOption: 'yearly' | 'monthly'
  teamId: string
  promotionCode?: string
}) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const upgradePlanInfo = await PlanInfoModel.get(planId)

  if (!upgradePlanInfo) {
    throw new ServiceValidationError(`Plan with id ${planId} not found`)
  }

  if (upgradePlanInfo.priceMonthlyCents === 0) {
    throw new ServiceValidationError('Cannot upgrade to a free plan')
  }

  if (upgradePlanInfo.id === workspaceContext.existingPlanInfo.id) {
    throw new ServiceValidationError('Cannot upgrade to your current plan')
  }

  const customer = await getCustomer(workspaceContext)

  // Check if the customer has an existing subscription

  const existingSubscriptions = await SubscriptionModel.getManyFiltered(
    'customer',
    customer.id
  )

  if (existingSubscriptions.length > 0) {
    throw new ServiceValidationError(
      'Cancel your existing subscription before upgrading your plan'
    )
  }

  const quotes = await QuoteModel.getManyFiltered('customer', customer.id)

  // See if there is an existing quote for the same plan

  const isEligibleTrial = await trialEligibility({ teamId })

  const existingQuote = quotes.find(
    (quote) => quote.metadata['planId'] === planId && quote.status === 'draft'
  )

  if (existingQuote) {
    const updated = await QuoteModel.update(existingQuote.id, {
      lineItems: [
        {
          price:
            pricingOption === 'yearly'
              ? upgradePlanInfo.yearlyPriceId
              : upgradePlanInfo.monthlyPriceId,
          quantity: 1,
        },
      ],
      promotionCode,
      trialDays:
        isEligibleTrial && upgradePlanInfo.freeTrialDays
          ? upgradePlanInfo.freeTrialDays
          : 0,
      isSubscription: true,
    })

    return updated
  }

  const created = await QuoteModel.create({
    customerId: customer.id,
    description: `${upgradePlanInfo.verboseName} (${pricingOption})`,
    lineItems: [
      {
        price:
          pricingOption === 'yearly'
            ? upgradePlanInfo.yearlyPriceId
            : upgradePlanInfo.monthlyPriceId,
        quantity: 1,
      },
    ],
    promotionCode,
    planId,
    trialDays:
      isEligibleTrial && upgradePlanInfo.freeTrialDays
        ? upgradePlanInfo.freeTrialDays
        : 0,
    isSubscription: true,
  })

  return created
}
