import {
  CreateMixin,
  UpdateMixin,
  GetMixin,
  GetManyFilteredMixin,
} from '@apiteam/types'
import type { Stripe } from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from 'src/lib/stripe'

import { CouponModel } from './coupon'

export type AbstractQuoteCreateParams = {
  customerId: string
  description: string
  lineItems: Stripe.QuoteCreateParams.LineItem[]
  promotionCode?: string
  planId?: string
  trialDays: number
}

export type AbstractQuoteUpdateParams = {
  description?: string
  promotionCode?: string
  lineItems?: Stripe.QuoteCreateParams.LineItem[]
  trialDays?: number
}

type QuoteMixin = {
  finalize: (id: string) => Promise<Stripe.Quote>
  accept: (id: string) => Promise<Stripe.Quote>
}

export const QuoteModel: CreateMixin<AbstractQuoteCreateParams, Stripe.Quote> &
  UpdateMixin<AbstractQuoteUpdateParams, Stripe.Quote> &
  GetMixin<Stripe.Quote> &
  GetManyFilteredMixin<Stripe.Quote, 'customer'> &
  QuoteMixin = {
  create: async (input) => {
    const coupon = input.promotionCode
      ? await CouponModel.getViaPromotionCode(input.promotionCode)
      : null

    return stripe.quotes.create({
      customer: input.customerId,
      description: input.description,
      line_items: input.lineItems,
      discounts: coupon ? [{ coupon: coupon.id }] : undefined,
      metadata: {
        promotionCode: input.promotionCode ?? null,
        planId: input.planId ?? null,
      },
    })
  },
  update: async (id, input) => {
    const coupon = input.promotionCode
      ? await CouponModel.getViaPromotionCode(input.promotionCode)
      : null

    const existingQuote = await QuoteModel.get(id)

    if (!existingQuote) {
      throw new ServiceValidationError(`Quote with id ${id} not found`)
    }

    const newMetadata = {
      ...existingQuote.metadata,
    }

    if (input.promotionCode) {
      newMetadata.promotionCode = input.promotionCode
    }

    return stripe.quotes.update(id, {
      discounts: coupon ? [{ coupon: coupon.id }] : undefined,
      description: input.description,
      line_items: input.lineItems,
      metadata: newMetadata,
    })
  },
  get: async (id) => {
    return stripe.quotes.retrieve(id).catch(() => null)
  },
  getMany: (ids) => {
    return Promise.all(ids.map(QuoteModel.get))
  },
  getManyFiltered: async (key, filterValue) => {
    if (typeof filterValue !== 'string') {
      throw new Error('Filter value must be a string')
    }
    return stripe.quotes
      .list({
        [key]: filterValue,
      })
      .then((result) => result.data)
  },
  finalize: async (id) => {
    return stripe.quotes.finalizeQuote(id)
  },
  accept: async (id) => {
    return stripe.quotes.accept(id)
  },
}
