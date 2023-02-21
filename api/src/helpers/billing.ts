import type Stripe from 'stripe'

import { PlanInfoModel } from '../models/billing/plan-info'

export const getCustomerBillingDetails = (
  customer: Stripe.Customer
): Stripe.PaymentMethodCreateParams.BillingDetails => {
  if (!customer.address) {
    throw new Error('Customer address not found')
  }

  if (!customer.email) {
    throw new Error('Customer email not found')
  }

  if (!customer.name) {
    throw new Error('Customer name not found')
  }

  if (!customer.address) {
    throw new Error('Customer address not found')
  }

  return {
    email: customer.email,
    name: customer.name,
    address: {
      line1: customer.address.line1 ?? undefined,
      line2: customer.address.line2 ?? undefined,
      city: customer.address.city ?? undefined,
      state: customer.address.state ?? undefined,
      postal_code: customer.address.postal_code ?? undefined,
      country: customer.address.country ?? undefined,
    },
  }
}

export const getFreePlanInfo = async () => {
  const planInfos = await PlanInfoModel.getAll()

  const freePlanInfo = planInfos.find(
    (planInfo) => planInfo.priceMonthlyCents === 0
  )

  if (!freePlanInfo) {
    throw new Error('No free plan found')
  }

  return freePlanInfo
}
