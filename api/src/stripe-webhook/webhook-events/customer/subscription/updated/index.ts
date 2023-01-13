import type Stripe from 'stripe'

import { handleNotifyDowngradeAtPeriodEnd } from './handle-downgrade-at-period-end'

type SubscriptionUpdatedEvent = {
  data: {
    object: Stripe.Subscription
    previous_attributes?: {
      cancel_at_period_end?: boolean
    }
  }
}

export const handleSubscriptionUpdated = async (
  rawEvent: Stripe.Event
): Promise<void> => {
  const event = rawEvent as unknown as SubscriptionUpdatedEvent

  if (!event.data.previous_attributes) {
    throw new Error("Updated event doesn't have previous_attributes")
  }

  const subscription = event.data.object
  const previous_attributes = event.data.previous_attributes

  if (
    previous_attributes.cancel_at_period_end === false &&
    subscription.cancel_at_period_end === true
  ) {
    await handleNotifyDowngradeAtPeriodEnd(subscription)
  }
}
