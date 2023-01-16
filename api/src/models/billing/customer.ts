import { APITeamModel } from '@apiteam/types'
import type Stripe from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from 'src/lib/stripe'

import { TeamModel } from '../team'
import { UserModel } from '../user'

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

type CustomerMixin = {
  markHadTrial: (customerId: string) => Promise<void>
  addTaxId: (
    customerId: string,
    taxIdObject: Stripe.TaxIdCreateParams
  ) => Promise<Stripe.TaxId>
  removeTaxId: (customerId: string) => Promise<Stripe.DeletedTaxId>
  getTaxId: (customerId: string) => Promise<Stripe.TaxId | null>
}

export const CustomerModel: APITeamModel<
  CustomerCreateInput,
  CustomerUpdateInput,
  Customer
> &
  CustomerMixin = {
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
  markHadTrial: async (customerId) => {
    const customer = await CustomerModel.get(customerId)

    if (!customer || customer.deleted) {
      throw new Error(`Customer with id ${customerId} found found`)
    }

    const variant = customer.metadata.variant
    const variantTargetId = customer.metadata.variantTargetId

    if (!variant || !variantTargetId) {
      throw new Error(
        `Customer with id ${customerId} has no variant or variantTargetId`
      )
    }

    if (variant === 'USER') {
      await UserModel.update(variantTargetId, {
        hadFreeTrial: true,
      })
    } else if (variant === 'TEAM') {
      await TeamModel.update(variantTargetId, {
        hadFreeTrial: true,
      })

      const teamOwnerMembership = await TeamModel.getOwnerMembership(
        variantTargetId
      )

      await UserModel.update(teamOwnerMembership.userId, {
        hadFreeTrial: true,
      })
    }
  },
  addTaxId: async (customerId, taxIdObject) => {
    const customer = await CustomerModel.get(customerId)

    if (!customer || customer.deleted) {
      throw new Error(`Customer with id ${customerId} found found`)
    }

    // Only allow one tax id per customer
    const taxIds = await stripe.customers.listTaxIds(customerId)

    if (taxIds.data.length > 0) {
      // Delete existing tax id
      await stripe.customers.deleteTaxId(customerId, taxIds.data[0].id)
    }

    const taxId = await stripe.customers.createTaxId(customerId, taxIdObject)

    // Verify tax id
    if (!taxId.verification) {
      await stripe.customers.deleteTaxId(customerId, taxId.id)

      throw new ServiceValidationError('Tax ID cannot be verified')
    }

    return taxId
  },
  removeTaxId: async (customerId) => {
    const customer = await CustomerModel.get(customerId)

    if (!customer || customer.deleted) {
      throw new Error(`Customer with id ${customerId} found found`)
    }

    const taxIds = await stripe.customers.listTaxIds(customerId)

    if (taxIds.data.length === 0) {
      throw new Error(`Customer with id ${customerId} has no tax id`)
    }

    return stripe.customers.deleteTaxId(customerId, taxIds.data[0].id)
  },
  getTaxId: async (customerId) => {
    const customer = await CustomerModel.get(customerId)

    if (!customer || customer.deleted) {
      throw new Error(`Customer with id ${customerId} found found`)
    }

    const taxIds = await stripe.customers.listTaxIds(customerId)

    if (taxIds.data.length === 0) {
      return null
    }

    return taxIds.data[0]
  },
}
