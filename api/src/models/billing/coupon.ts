import { GetMixin } from '@apiteam/types-commonjs'
import type { Stripe } from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from '../../lib/stripe'

type GetCouponViaCodeMixin = {
  getViaPromotionCode: (code: string) => Promise<Stripe.Coupon | null>
}

export const CouponModel: GetMixin<Stripe.Coupon> & GetCouponViaCodeMixin = {
  get: async (id) => {
    return stripe.coupons.retrieve(id).catch(() => null)
  },
  getMany: async (ids) => {
    return Promise.all(ids.map(CouponModel.get))
  },
  getViaPromotionCode: async (code) => {
    const promotionCodes = await stripe.promotionCodes
      .list({
        code,
      })
      .then((response) => response.data)

    if (promotionCodes.length === 0) {
      throw new ServiceValidationError(`Promotion code ${code} not found`)
    }

    return promotionCodes[0].coupon
  },
}
