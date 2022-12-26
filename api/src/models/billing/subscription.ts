import { APITeamModel } from '@apiteam/types'
import type Stripe from 'stripe'

import { stripe } from 'src/lib/stripe'

export type SubscriptionCreateInput = {
  customerId: string
  priceId: string
  freeTrialDays?: number
}

export type Subscription = Stripe.Subscription

export const SubscriptionModel: APITeamModel<
  SubscriptionCreateInput,
  never,
  Subscription
> = {
  create: async (input) => {
    return stripe.subscriptions.create({
      customer: input.customerId,
      items: [{ price: input.priceId }],
      trial_period_days: input.freeTrialDays,
    })
  },
  update: async (_1, _2) => {
    throw new Error('Not implemented')
  },
  delete: async (id) => {
    const subscription = await stripe.subscriptions.retrieve(id)
    await stripe.subscriptions.del(id)

    return subscription
  },
  exists: async (id) => {
    const subscription = await stripe.subscriptions
      .retrieve(id)
      .catch(() => null)
    return !!subscription
  },
  get: async (id) => {
    return await stripe.subscriptions.retrieve(id)
  },
}
