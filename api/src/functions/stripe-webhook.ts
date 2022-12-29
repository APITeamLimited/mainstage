import type { APIGatewayProxyEvent } from 'aws-lambda'
import type Stripe from 'stripe'

import { checkValue } from 'src/config'
import { stripe } from 'src/lib/stripe'

const webhookSecret = checkValue<string>('api.stripe.webhookSecret')

export const handler = async (event: APIGatewayProxyEvent, _: never) => {
  const error = await handleWebhookEvent(event)

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

  await processWebhookEvent(stripeEvent)

  return null
}

const processWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  // if (event.type === 'checkout.session.completed') {
  //     // Get setup intent from event
  //     const checkoutSession = event.data.object as Stripe.Checkout.Session
  // }

  // TODO: Handle webhook events
  console.log('Unhandled webhook event:', event)
}
