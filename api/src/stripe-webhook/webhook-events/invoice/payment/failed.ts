import type { MailmanInput, NotifyPaymentFailedData } from '@apiteam/mailman'
import { Team } from '@prisma/client'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from '../../../../helpers'
import { dispatchEmail } from '../../../../lib/mailman'
import { CustomerModel } from '../../../../models'
import { ensureCorrectDescriptionInvoice } from '../../../../utils/ensure-correct-description-invoice'
import { customerIdentificationSchema } from '../../customer'
import { getAdminOwnerSendInfo, getInvoiceLast4 } from '../helpers'

export const handlePaymentFailed = async (event: Stripe.Event) => {
  const invoice = await ensureCorrectDescriptionInvoice(
    event.data.object as Stripe.Invoice
  )

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

      const mailmanInput: MailmanInput<NotifyPaymentFailedData> = {
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
