import type { UserAsPersonal } from '@apiteam/types'
import type { Team, PlanInfo } from '@prisma/client'
import type Stripe from 'stripe'

import { CustomerModel, PlanInfoModel } from 'src/models'
import { SubscriptionModel } from 'src/models/billing/subscription'
import {
  handleActivationTeam,
  handleActivationUser,
} from 'src/stripe-webhook/webhook-events/customer/subscription/created'

import { customerIdentificationSchema } from '../../../customer'

export const checkForPlanActivation = async (
  invoice: Stripe.Invoice,
  team: Team | null,
  users: UserAsPersonal[]
) => {
  // Check if invoice is for a subscription
  if (!invoice.subscription) {
    return
  }

  // Check if invoice is for a new subscription

  const subscription =
    typeof invoice.subscription === 'string'
      ? await SubscriptionModel.get(invoice.subscription)
      : invoice.subscription

  if (!subscription || subscription.status !== 'active') {
    return
  }

  if (
    typeof subscription.customer !== 'string' &&
    'deleted' in subscription.customer
  ) {
    throw new Error('Customer is deleted')
  }

  const customer =
    typeof subscription.customer === 'string'
      ? await CustomerModel.get(subscription.customer)
      : subscription.customer

  if (!customer) {
    throw new Error('Customer not found')
  }

  const { variant, variantTargetId } = customerIdentificationSchema.parse(
    customer.metadata
  )

  const existingPlanInfo = await getExistingPlanInfo(team, users)

  if (subscriptionAlreadyApplied(subscription, existingPlanInfo)) {
    return
  }

  if (variant === 'TEAM') {
    await handleActivationTeam(variantTargetId, subscription)
  } else {
    await handleActivationUser(variantTargetId, subscription)
  }
}

const getExistingPlanInfo = async (
  team: Team | null,
  users: UserAsPersonal[]
) => {
  if (team) {
    if (!team.planInfoId) {
      throw new Error('Team has no plan info')
    }

    return PlanInfoModel.get(team.planInfoId).then((planInfo) => {
      if (!planInfo) {
        throw new Error('Plan info not found')
      }

      return planInfo
    })
  }

  if (!users[0].planInfoId) {
    throw new Error('User has no plan info')
  }

  return PlanInfoModel.get(users[0].planInfoId).then((planInfo) => {
    if (!planInfo) {
      throw new Error('Plan info not found')
    }

    return planInfo
  })
}

const subscriptionAlreadyApplied = (
  subscription: Stripe.Subscription,
  existingPlanInfo: PlanInfo
): boolean => {
  for (const item of subscription.items.data) {
    if (!item.plan.product) {
      throw new Error('Product not found')
    }

    if (
      typeof item.plan.product !== 'string' &&
      'deleted' in item.plan.product
    ) {
      throw new Error('Product is deleted')
    }

    const productId =
      typeof item.plan.product === 'string'
        ? item.plan.product
        : item.plan.product.id

    if (productId === existingPlanInfo.productId) {
      return true
    }
  }

  return false
}
