import { APITeamModel } from '@apiteam/types'
import type Stripe from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from 'src/lib/stripe'

export type CustomerCreateInput = {
  variantTargetId: string
  variant: 'USER' | 'TEAM'
  email: string
  address?: Stripe.AddressParam
  name?: string
}

export type CustomerUpdateInput = {
  email?: string
  address?: Stripe.AddressParam
  name?: string
  defaultSourceId?: string
}

export type Customer = Stripe.Customer

export const CustomerModel: APITeamModel<
  CustomerCreateInput,
  CustomerUpdateInput,
  Customer
> = {
  create: async (input) => {
    return stripe.customers.create({
      email: input.email,
      address: input.address ?? '',
      name: input.name ?? '',
      metadata: {
        variant: input.variant,
        variantTargetId: input.variantTargetId,
      },
    })
  },
  update: async (id, input) => {
    const customer = await stripe.customers.retrieve(id)

    if (customer.deleted) {
      throw new ServiceValidationError(`Customer with id ${id} deleted`)
    }

    return stripe.customers.update(id, {
      email: input.email,
      address: input.address,
      name: input.name,
      default_source: input.defaultSourceId,
    })
  },
  delete: async (id) => {
    const customer = await stripe.customers.retrieve(id)

    if (customer.deleted) {
      throw new ServiceValidationError(`Customer with id ${id} already deleted`)
    }

    await stripe.customers.del(id)

    // Customer object will already be deleted so don't update UserModel or TeamModel

    return customer
  },
  exists: async (id) => {
    const customer = await stripe.customers.retrieve(id).catch(() => null)
    return !!customer && !customer.deleted
  },
  get: async (id) => {
    const customer = await stripe.customers.retrieve(id)

    if (customer.deleted) {
      throw new Error(`Customer with id ${id} deleted`)
    }

    return customer
  },
  getMany: async (ids) => {
    return Promise.all(ids.map(CustomerModel.get))
  },
}
