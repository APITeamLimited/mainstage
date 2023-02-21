import type { APIGatewayProxyEvent } from 'aws-lambda'
import type Stripe from 'stripe'

import { checkValue } from '../config'
import { stripe } from '../lib/stripe'

import { handleSubscriptionCreated } from './webhook-events/customer/subscription/created'
import { handleSubscriptionDeleted } from './webhook-events/customer/subscription/deleted'
import { handleSubscriptionTrialWillEnd } from './webhook-events/customer/subscription/trial-will-end'
import { handleSubscriptionUpdated } from './webhook-events/customer/subscription/updated'
import { handleInvoiceFinalized } from './webhook-events/invoice/finalized'
import { handlePaymentFailed } from './webhook-events/invoice/payment/failed'
import { handleInvoicePaid } from './webhook-events/invoice/payment/paid'

const webhookSecret = checkValue<string>('stripe.webhookSecret')

export const supportedStripeEvents = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  // Disabled as triggers at same time as invoice.payment_failed
  //'invoice.payment_action_required',
] as Stripe.WebhookEndpointCreateParams.EnabledEvent[]

export const stripeHandler = async (
  gatewayEvent: APIGatewayProxyEvent,
  _: never
) => {
  const error = await handleWebhookEvent(gatewayEvent)

  if (error) {
    console.log(
      'An error occurred while processing a Stripe webhook event:',
      error.message
    )
  }

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

  try {
    await processWebhookEvent(stripeEvent)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } catch (error: Error) {
    return error
  }

  return null
}

const processWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  if (event.type === 'customer.subscription.created') {
    await handleSubscriptionCreated(event)
  } else if (event.type === 'customer.subscription.updated') {
    await handleSubscriptionUpdated(event)
  } else if (event.type === 'customer.subscription.deleted') {
    await handleSubscriptionDeleted(event)
  } else if (event.type === 'customer.subscription.trial_will_end') {
    handleSubscriptionTrialWillEnd(event)
  } else if (event.type === 'invoice.finalized') {
    await handleInvoiceFinalized(event)
    // 'invoice.payment_succeeded' could also be used here but we don't want to
    // fire on partially paid invoices
  } else if (event.type === 'invoice.paid') {
    await handleInvoicePaid(event)
  } else if (event.type === 'invoice.payment_failed') {
    await handlePaymentFailed(event)
  }

  // Disabled as triggers at same time as invoice.payment_failed
  //else if (event.type === 'invoice.payment_action_required') {
  //  await handlePaymentActionRequired(event)
  //}
  else {
    throw new Error(`Unsupported event type: ${event.type}`)
  }
}
