import { APITeamModel } from '@apiteam/types'
import type Stripe from 'stripe'

import { db } from 'src/lib/db'
import { stripe } from 'src/lib/stripe'

import { TeamModel } from '../team'
import { UserModel } from '../user'

export type CustomerCreateInput = {
  variantTargetId: string
  variant: 'USER' | 'TEAM'
  email: string
}

export type CustomerUpdateInput = {
  email: string
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
      metadata: {
        variant: input.variant,
        variantTargetId: input.variantTargetId,
      },
    })
  },
  update: async (id, input) => {
    const customer = await stripe.customers.retrieve(id)

    if (customer.deleted) {
      throw new Error(`Customer with id ${id} deleted`)
    }

    return stripe.customers.update(id, {
      email: input.email,
    })
  },
  delete: async (id) => {
    const customer = await stripe.customers.retrieve(id)

    if (customer.deleted) {
      throw new Error(`Customer with id ${id} already deleted`)
    }

    await stripe.customers.del(id)

    // Anywhere the customerId is used eg on Team and User, the customerId will remain
    // so make sure the parent object is deleted first

    const [users, teams] = await Promise.all([
      db.user.findMany({
        where: { customerId: id },
      }),
      db.team.findMany({
        where: { customerId: id },
      }),
    ])

    await Promise.all([
      ...users.map((user) => UserModel.update(user.id, { customerId: null })),
      ...teams.map((team) => TeamModel.update(team.id, { customerId: null })),
    ])

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
}
