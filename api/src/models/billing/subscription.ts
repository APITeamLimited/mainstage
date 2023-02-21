import { APITeamModel, GetManyFilteredMixin } from '@apiteam/types-commonjs'
import type Stripe from 'stripe'

import { stripe } from '../../lib/stripe'

export type SubscriptionCreateInput = {
  customerId: string
  priceId: string
  freeTrialDays?: number
}

export type SubscriptionUpdateInput = {
  cancelAtPeriodEnd?: boolean
}

export const SubscriptionModel: APITeamModel<
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  Stripe.Subscription
> &
  GetManyFilteredMixin<Stripe.Subscription, 'customer'> = {
  create: async (input) => {
    return stripe.subscriptions.create({
      customer: input.customerId,
      items: [{ price: input.priceId }],
      trial_period_days: input.freeTrialDays,
    })
  },
  update: async (id, input) => {
    return stripe.subscriptions.update(id, {
      cancel_at_period_end: input.cancelAtPeriodEnd,
    })
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
  getMany: async (ids) => {
    return Promise.all(ids.map(SubscriptionModel.get))
  },
  getManyFiltered: async (key, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Value for key ${key} must be a string`)
    }

    return stripe.subscriptions
      .list({
        [key]: value,
      })
      .then((result) => result.data)
  },
}
