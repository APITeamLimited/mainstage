import type { PlanInfo } from '@prisma/client'
import type { Stripe } from 'stripe'

import { PlanInfoModel } from 'src/models'

export const ensureCorrectDescriptionInvoice = async (
  invoice: Stripe.Invoice
) => {
  if (invoice.lines.data.length === 0) {
    invoice.description = 'Invoice'
    return invoice
  }

  const isSubscription = invoice.lines.data.find(
    (line) => line.type === 'subscription'
  )

  if (!isSubscription) {
    if (!invoice.description) {
      invoice.description = 'Invoice'
    }
    return invoice
  }

  if (
    typeof invoice.lines.data[0].price === 'object' &&
    invoice.lines.data[0].price === null
  ) {
    invoice.description = 'Invoice'
    return invoice
  }

  // Check if trial invoice
  const trial = invoice.lines.data.find((line) =>
    line.description?.includes('Trial')
  )
    ? true
    : false

  const priceId =
    typeof invoice.lines.data[0].price === 'string'
      ? invoice.lines.data[0].price
      : invoice.lines.data[0].price.id

  const price = await getPrice(priceId)

  if (!price) {
    invoice.description = 'Invoice'
    return invoice
  }

  if (trial) {
    invoice.description = `Trial period for ${price.planInfo.verboseName}`
    return invoice
  }

  invoice.description = `${price.planInfo.verboseName} (${price.billingCycle})`

  return invoice
}

const getPrice = async (
  priceId: string
): Promise<{
  planInfo: PlanInfo
  billingCycle: 'monthly' | 'yearly'
} | null> => {
  const planInfoMonthly = await PlanInfoModel.getIndexedField(
    'monthlyPriceId',
    priceId
  )

  if (planInfoMonthly) {
    return {
      planInfo: planInfoMonthly,
      billingCycle: 'monthly',
    }
  }

  const planInfoYearly = await PlanInfoModel.getIndexedField(
    'yearlyPriceId',
    priceId
  )

  if (planInfoYearly) {
    return {
      planInfo: planInfoYearly,
      billingCycle: 'yearly',
    }
  }

  return null
}
