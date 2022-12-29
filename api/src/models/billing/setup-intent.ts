import { APITeamModel, GetManyFilteredMixin } from '@apiteam/types'
import type Stripe from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from 'src/lib/stripe'

export type SetupIntentCreateInput = {
  customerId: string
}

export type SetupIntent = Stripe.SetupIntent

export const SetupIntentModel: Omit<
  APITeamModel<SetupIntentCreateInput, never, SetupIntent>,
  'update'
> &
  GetManyFilteredMixin<SetupIntent, 'customer'> = {
  create: async (input) => {
    return stripe.setupIntents.create({
      customer: input.customerId,
      payment_method_types: ['card'],
      confirm: true,
      usage: 'off_session',
    })
  },
  delete: async (id) => {
    const setupIntent = await stripe.setupIntents.retrieve(id)

    if (setupIntent.status === 'canceled') {
      throw new ServiceValidationError(
        `SetupIntent with id ${id} already canceled`
      )
    }

    await stripe.setupIntents.cancel(id)

    return setupIntent
  },
  exists: async (id) => {
    const setupIntent = await stripe.setupIntents.retrieve(id).catch(() => null)
    return !!setupIntent
  },
  get: async (id) => {
    return stripe.setupIntents.retrieve(id)
  },
  getMany: async (ids) => {
    return Promise.all(ids.map((id) => stripe.setupIntents.retrieve(id)))
  },
  getManyFiltered: async (key, filterValue) => {
    if (typeof filterValue !== 'string') {
      throw new ServiceValidationError(
        `Filter value for key ${key} must be a string`
      )
    }

    return stripe.setupIntents
      .list({
        [key]: filterValue,
      })
      .then((result) => result.data)
  },
}
