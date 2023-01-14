import type {
  MailmanInput,
  NotifyPaymentSuccessfulData,
} from '@apiteam/mailman'
import { Team } from '@prisma/client'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { dispatchEmail } from 'src/lib/mailman'
import { getCreditsReadRedis } from 'src/lib/redis'
import { CreditsPricingOptionModel, CustomerModel } from 'src/models'
import { QuoteModel } from 'src/models/billing/quotes'

import { customerIdentificationSchema } from '../../customer'
import { getAdminOwnerSendInfo, getInvoiceLast4 } from '../helpers'

export const handleInvoicePaid = async (event: Stripe.Event) => {
  const invoice = event.data.object as Stripe.Invoice

  // Get customer
  const customer = await CustomerModel.get(invoice.customer as string)

  if (!customer) {
    throw new Error(`Customer not found: ${invoice.customer}`)
  }

  // Get variant and variantTargetId
  const { variant, variantTargetId } = customerIdentificationSchema.parse(
    customer.metadata
  )

  if (await determineIfForCreditsPurchase(invoice, variant, variantTargetId)) {
    return
  }

  const { users, team, adminOwnerMemberships } = await getAdminOwnerSendInfo(
    variant,
    variantTargetId
  )

  await Promise.all(
    users.map(async (user) => {
      const role = adminOwnerMemberships.find(
        (membership) => membership.userId === user.id
      )?.role

      if (variant === 'TEAM' && !role) {
        return
      }

      const mailmanInput: MailmanInput<NotifyPaymentSuccessfulData> = {
        template: 'notify-payment-successful',
        to: user.email,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
        data:
          variant === 'TEAM'
            ? {
                targetName: `${user.firstName} ${user.lastName}`,
                invoice,
                last4: await getInvoiceLast4(invoice),
                role: role as string as 'ADMIN' | 'OWNER',
                workspaceName: (team as Team).name,
              }
            : {
                targetName: `${user.firstName} ${user.lastName}`,
                invoice,
                last4: await getInvoiceLast4(invoice),
                role: 'OWN-ACCOUNT',
                workspaceName: undefined,
              },
      }

      return dispatchEmail(mailmanInput)
    })
  )
}

const determineIfForCreditsPurchase = async (
  invoice: Stripe.Invoice,
  variant: 'TEAM' | 'USER',
  variantTargetId: string
) => {
  if (!invoice.quote) {
    return false
  }

  const quote =
    typeof invoice.quote === 'string'
      ? await QuoteModel.get(invoice.quote).then((quote) => {
          if (!quote) {
            throw new Error(`Quote not found: ${invoice.quote}`)
          }
          return quote
        })
      : invoice.quote

  if (!quote.metadata['creditsPricingOptionId']) {
    return false
  }

  const creditsUnitAmount = await CreditsPricingOptionModel.get(
    quote.metadata['creditsPricingOptionId']
  ).then((creditsPricingOption) => {
    if (!creditsPricingOption) {
      throw new Error(
        `Credits pricing option not found: ${quote.metadata['creditsPricingOptionId']}`
      )
    }
    return creditsPricingOption.credits
  })

  const quantity = invoice.lines.data.reduce(
    (acc, lineItem) => acc + (lineItem.quantity ?? 0),
    0
  )

  const creditsReadRedis = await getCreditsReadRedis()

  // Increment credits by the amount purchased

  await creditsReadRedis.incrBy(
    `${variant}:${variantTargetId}:paidCredits`,
    quantity * creditsUnitAmount
  )

  return true
}
