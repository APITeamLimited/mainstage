import {
  APITeamModel,
  GetManyFilteredMixin,
  IndexedFieldMixin,
} from '@apiteam/types-commonjs'
import type Stripe from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from '../../lib/stripe'

export type SetupIntentCreateInput = {
  customerId: string
  paymentMethodId?: string
}

export type SetupIntent = Stripe.SetupIntent

type SetupIntentIndexableFields = 'id' | 'payment_method' | 'customer'

export const SetupIntentModel: Omit<
  APITeamModel<SetupIntentCreateInput, never, SetupIntent>,
  'update'
> &
  GetManyFilteredMixin<SetupIntent, SetupIntentIndexableFields> &
  IndexedFieldMixin<SetupIntent, SetupIntentIndexableFields> = {
  create: async (input) => {
    return stripe.setupIntents.create({
      customer: input.customerId,
      payment_method_types: ['card'],
      payment_method: input.paymentMethodId,
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
  getIndexedField: async (key, value) => {
    if (!value) {
      throw new ServiceValidationError('Indexed field value required')
    }

    if (typeof value !== 'string') {
      throw new ServiceValidationError(
        `Indexed field value must be a string, received ${typeof value}`
      )
    }

    return stripe.setupIntents
      .list({
        [key]: value,
      })
      .then((result) => result.data[0])
  },
  indexedFieldExists: async (key, value) => {
    if (!value) {
      throw new ServiceValidationError('Indexed field value required')
    }

    if (typeof value !== 'string') {
      throw new ServiceValidationError(
        `Indexed field value must be a string, received ${typeof value}`
      )
    }

    return stripe.setupIntents
      .list({
        [key]: value,
      })
      .then((result) => result.data.length > 0)
  },
}
