import type { APIGatewayProxyEvent } from 'aws-lambda'
import type Stripe from 'stripe'

import { checkValue } from 'src/config'
import { stripe } from 'src/lib/stripe'

import { handleSubscriptionTrialWillEnd } from './webhook-events/customer/subscription/trial-will-end'
import { handleSubscriptionUpdated } from './webhook-events/customer/subscription/updated'
import { handlePaymentActionRequired } from './webhook-events/invoice/payment/action-required'
import { handlePaymentFailed } from './webhook-events/invoice/payment/failed'
import { handlePaymentSucceeded } from './webhook-events/invoice/payment/succeeded'

const webhookSecret = checkValue<string>('stripe.webhookSecret')

const verifyWebhooks = process.env.NODE_ENV !== 'development'

export const supportedStripeEvents = [
  'customer.subscription.updated',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.updated',
  'invoice.payment_failed',
  'invoice.payment_succeeded',
] as Stripe.WebhookEndpointCreateParams.EnabledEvent[]

export const stripeHandler = async (event: APIGatewayProxyEvent, _: never) => {
  const error = verifyWebhooks
    ? await handleWebhookEvent(event)
    : await handleWebhookEventNoVefify(event)

  return error
    ? {
        statusCode: 400,
        body: `Webhook Error: ${error.message}`,
      }
    : {
        statusCode: 200,
        body: 'Success',
      }
}

const handleWebhookEvent = async (
  event: APIGatewayProxyEvent
): Promise<Error | null> => {
  const signature = event.headers['stripe-signature']

  if (!signature) {
    return new Error('No signature found')
  }

  // Get body from event
  const body = event.body

  if (!body) {
    return new Error('No body found')
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } catch (error: Error) {
    return error
  }

  return processWebhookEvent(stripeEvent)
    .catch((error: Error) => error)
    .then(() => null)
}

/**
 * When forwarding webhooks in dev, these webhooks are not signed
 */
const handleWebhookEventNoVefify = async (
  event: APIGatewayProxyEvent
): Promise<Error | null> => {
  // Get body from event
  const body = event.body

  if (!body) {
    return new Error('No body found')
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = JSON.parse(body)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } catch (error: Error) {
    return error
  }

  return processWebhookEvent(stripeEvent)
    .catch((error: Error) => error)
    .then(() => null)
}

const processWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  if (event.type === 'customer.subscription.updated') {
    await handleSubscriptionUpdated(event)
  } else if (event.type === 'customer.subscription.trial_will_end') {
    handleSubscriptionTrialWillEnd(event)
  } else if (event.type === 'invoice.payment_action_required') {
    // TODO: Figure out if this needs to be handled differently, if at all?
    await handlePaymentActionRequired(event)
  } else if (event.type === 'invoice.payment_failed') {
    await handlePaymentFailed(event)
  } else if (event.type === 'invoice.payment_succeeded') {
    await handlePaymentSucceeded(event)
  } else {
    throw new Error(`Unsupported event type: ${event.type}`)
  }
}
