import { checkValue } from 'api/src/config'
import { stripe } from 'api/src/lib/stripe'
import { supportedStripeEvents } from 'api/src/stripe-webhook'

const gatewayUrl = checkValue<string>('gateway.url')

// Create webhooks
const webhookEndpoint = `${gatewayUrl}/api/stripe-webhook`

export default async () => {
  // Delete all existing webhooks
  const existingWebhooks = (await stripe.webhookEndpoints.list()).data

  if (existingWebhooks.length > 0) {
    console.log(`Deleting ${existingWebhooks.length} existing webhooks...`)

    for (const endpoint of existingWebhooks) {
      await stripe.webhookEndpoints.del(endpoint.id)
    }
  }

  console.log(`Creating webhook for '${webhookEndpoint}'...`)

  await stripe.webhookEndpoints.create({
    url: webhookEndpoint,
    enabled_events: supportedStripeEvents,
  })

  console.log('Webhooks created.')
}
