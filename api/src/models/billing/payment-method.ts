import { APITeamModel, GetManyFilteredMixin } from '@apiteam/types-commonjs'
import type { Stripe } from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from '../../lib/stripe'

export type AbstractCreatePaymentMethodInput = {
  type: 'card'
  customerId: string
  billingDetails: Stripe.PaymentMethodCreateParams.BillingDetails
  tokenId: string
}

export type AbstractUpdatePaymentMethodInput = {
  billingDetails?: Stripe.PaymentMethodUpdateParams.BillingDetails
}

export const PaymentMethodModel: APITeamModel<
  AbstractCreatePaymentMethodInput,
  AbstractUpdatePaymentMethodInput,
  Stripe.PaymentMethod
> &
  GetManyFilteredMixin<Stripe.PaymentMethod, 'customer'> = {
  create: async (input) => {
    const token = await stripe.tokens.retrieve(input.tokenId)

    if (token.type !== 'card') {
      throw new Error('Token is not a card')
    }

    // Get users existing payment methods to check new card is not a duplicate

    const paymentMethods = await stripe.paymentMethods.list({
      customer: input.customerId,
      type: 'card',
    })

    const existingCard =
      paymentMethods.data.find(
        (pm) =>
          pm.type === 'card' && pm.card?.fingerprint === token.card?.fingerprint
      ) !== undefined

    if (existingCard) {
      throw new ServiceValidationError(
        'This card is already attached to this workspace'
      )
    }

    const paymentMethod = await stripe.paymentMethods
      .create({
        type: input.type,
        billing_details: input.billingDetails,
        card: {
          token: input.tokenId,
        },
      })
      .catch((err) => {
        throw new ServiceValidationError(err.message)
      })

    // Attach payment method to customer
    await stripe.paymentMethods
      .attach(paymentMethod.id, {
        customer: input.customerId,
      })
      .catch((err) => {
        throw new ServiceValidationError(err.message)
      })

    await addDefaultPaymentMethod(paymentMethod, input.customerId)

    return paymentMethod
  },
  update: async (id, input) => {
    const updatedPaymentMethod = await stripe.paymentMethods.update(id, {
      billing_details: input.billingDetails,
    })

    return updatedPaymentMethod
  },
  delete: async (id) => {
    const paymentMethod = await stripe.paymentMethods.retrieve(id)
    await stripe.paymentMethods.detach(id)

    if (paymentMethod.customer) {
      await setNewDefaultPaymentMethod(
        typeof paymentMethod.customer === 'string'
          ? paymentMethod.customer
          : paymentMethod.customer.id,
        paymentMethod.id
      )
    }

    return paymentMethod
  },
  exists: async (id) => {
    const paymentMethod = await stripe.paymentMethods
      .retrieve(id)
      .catch(() => null)
    return !!paymentMethod
  },
  get: async (id) => {
    return stripe.paymentMethods.retrieve(id)
  },
  getMany: async (ids) => {
    return Promise.all(ids.map((id) => stripe.paymentMethods.retrieve(id)))
  },
  getManyFiltered: async (key, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Value for key ${key} must be a string`)
    }

    return stripe.paymentMethods
      .list({
        [key]: value,
      })
      .then((result) => result.data)
  },
}

// Sets a default payment method for a customer if none exists
const addDefaultPaymentMethod = async (
  paymentMethod: Stripe.PaymentMethod,
  customerId: string
): Promise<Stripe.PaymentMethod | null> => {
  if (paymentMethod.customer) {
    return null
  }

  const customer = await stripe.customers.retrieve(customerId)

  if (customer.deleted) {
    throw new ServiceValidationError(`Customer with id ${customerId} deleted`)
  }

  if (customer.invoice_settings.default_payment_method) {
    return null
  }

  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  })

  return paymentMethod
}

// Finds a new default payment method for a customer on old default deletion
const setNewDefaultPaymentMethod = async (
  customerId: string,
  deletedPaymentMethodId: string
): Promise<Stripe.PaymentMethod | null> => {
  const customer = await stripe.customers.retrieve(customerId)

  if (customer.deleted) {
    throw new ServiceValidationError(`Customer with id ${customerId} deleted`)
  }

  if (
    customer.invoice_settings.default_payment_method !== deletedPaymentMethodId
  ) {
    return null
  }

  const paymentMethods = await stripe.paymentMethods
    .list({
      customer: customerId,
    })
    .then((result) =>
      result.data.filter((pm) => pm.id !== deletedPaymentMethodId)
    )

  if (paymentMethods.length === 0) {
    return null
  }

  const newDefaultPaymentMethod = paymentMethods[0]

  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: newDefaultPaymentMethod.id,
    },
  })

  return newDefaultPaymentMethod
}
