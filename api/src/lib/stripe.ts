import Stripe from 'stripe'

import { checkValue } from '../config'

const STRIPE_SECRET_KEY = checkValue<string>('stripe.secretKey')

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})
