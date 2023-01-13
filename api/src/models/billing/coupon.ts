import { GetMixin } from '@apiteam/types'
import type { Stripe } from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { stripe } from 'src/lib/stripe'

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
    const promotionCode = await stripe.promotionCodes
      .retrieve(code)
      .catch(() => null)

    if (!promotionCode) {
      throw new ServiceValidationError('Promotion code not found')
    }

    return promotionCode.coupon
  },
}
