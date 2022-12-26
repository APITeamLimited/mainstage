import Stripe from 'stripe'

import { checkValue } from 'src/config'

const STRIPE_SECRET_KEY = checkValue<string>('api.stripe.secretKey')
export const STRIPE_PUBLISHABLE_KEY = checkValue<string>(
  'api.stripe.publishableKey'
)

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})
