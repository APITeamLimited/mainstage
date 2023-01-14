import { ServiceValidationError } from '@redwoodjs/api'

import { SubscriptionModel } from 'src/models/billing/subscription'

import { authenticateAndGetContext, getCustomer } from './helpers'

export const subscription = async ({ teamId }: { teamId?: string }) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const customer = await getCustomer(workspaceContext)

  const existingSubscriptions = await SubscriptionModel.getManyFiltered(
    'customer',
    customer.id
  )

  if (existingSubscriptions.length === 0) {
    return null
  }

  return existingSubscriptions[0]
}

export const downgradePlan = async ({ teamId }: { teamId?: string }) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const customer = await getCustomer(workspaceContext)

  const existingSubscriptions = await SubscriptionModel.getManyFiltered(
    'customer',
    customer.id
  )

  if (existingSubscriptions.length === 0) {
    throw new ServiceValidationError('No subscriptions found for customer')
  }

  const subscription = existingSubscriptions[0]

  if (subscription.cancel_at_period_end) {
    throw new ServiceValidationError(
      'Subscription already marked for cancellation'
    )
  }

  return SubscriptionModel.update(subscription.id, {
    cancelAtPeriodEnd: true,
  })
}

export const cancelDowngradePlan = async ({ teamId }: { teamId?: string }) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const customer = await getCustomer(workspaceContext)

  const existingSubscriptions = await SubscriptionModel.getManyFiltered(
    'customer',
    customer.id
  )

  if (existingSubscriptions.length === 0) {
    throw new ServiceValidationError('No subscriptions found for customer')
  }

  const subscription = existingSubscriptions[0]

  if (!subscription.cancel_at_period_end) {
    throw new ServiceValidationError('Subscription not marked for cancellation')
  }

  return SubscriptionModel.update(subscription.id, {
    cancelAtPeriodEnd: false,
  })
}
