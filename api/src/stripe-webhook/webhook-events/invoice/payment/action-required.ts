import type {
  MailmanInput,
  NotifyPaymentActionRequiredData,
} from '@apiteam/mailman'
import { Team } from '@prisma/client'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { dispatchEmail } from 'src/lib/mailman'
import { CustomerModel } from 'src/models'

import { customerIdentificationSchema } from '../../customer'
import { getAdminOwnerSendInfo, getInvoiceLast4 } from '../helpers'

export const handlePaymentActionRequired = async (event: Stripe.Event) => {
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

  const { users, team, adminOwnerMemberships } = await getAdminOwnerSendInfo(
    variant,
    variantTargetId
  )

  await Promise.all(
    users.map(async (user) => {
      if (!user) {
        return
      }

      const role = adminOwnerMemberships.find(
        (membership) => membership.userId === user.id
      )?.role

      if (variant === 'TEAM' && !role) {
        return
      }

      const mailmanInput: MailmanInput<NotifyPaymentActionRequiredData> = {
        template: 'notify-payment-failed',
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
