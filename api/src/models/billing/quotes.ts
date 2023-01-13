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
import { CustomerModel } from './customer'

export type AbstractQuoteCreateParams = {
  customerId: string
  description: string
  lineItems: Stripe.QuoteCreateParams.LineItem[]
  promotionCode?: string
  planId?: string
  trialDays?: number
  isSubscription: boolean
}

export type AbstractQuoteUpdateParams = {
  description?: string
  promotionCode?: string
  lineItems?: Stripe.QuoteCreateParams.LineItem[]
  trialDays?: number
  isSubscription: boolean
}

type QuoteMixin = {
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
      subscription_data: input.isSubscription
        ? {
            trial_period_days: input.trialDays,
            description: input.description,
          }
        : undefined,
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
      subscription_data: input.isSubscription
        ? {
            trial_period_days: input.trialDays,
            description: input.description,
          }
        : undefined,
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
  accept: async (id) => {
    await stripe.quotes.finalizeQuote(id)
    const acceptedQuote = await stripe.quotes.accept(id)

    if (!acceptedQuote.invoice) {
      throw new Error('Quote invoice not found')
    }

    await markHadTrialIfApplicable(acceptedQuote)

    const invoiceId =
      typeof acceptedQuote.invoice === 'string'
        ? acceptedQuote.invoice
        : acceptedQuote.invoice.id

    // Set invoice description to quote description
    if (acceptedQuote.description) {
      await stripe.invoices.update(invoiceId, {
        description: acceptedQuote.description,
      })
    }

    // Finalize the invoice
    await stripe.invoices.finalizeInvoice(invoiceId)

    // Pay the invoice
    await stripe.invoices.pay(invoiceId)

    return acceptedQuote
  },
}

const markHadTrialIfApplicable = async (quote: Stripe.Quote) => {
  if (
    !(
      quote.subscription_data.trial_period_days &&
      quote.subscription_data.trial_period_days > 0
    )
  ) {
    return
  }

  if (!quote.customer) {
    throw new Error('Quote customer not found')
  }

  const customerId =
    typeof quote.customer === 'string' ? quote.customer : quote.customer.id

  await CustomerModel.markHadTrial(customerId)
}
