import type {
  MailmanInput,
  NotifyPaymentSuccessfulData,
} from '@apiteam/mailman'
import { UserAsPersonal } from '@apiteam/types'
import { Team, Membership } from '@prisma/client'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { dispatchEmail } from 'src/lib/mailman'
import { CustomerModel } from 'src/models'
import { ensureCorrectDescriptionInvoice } from 'src/utils/ensure-correct-description-invoice'

import { customerIdentificationSchema } from '../../../customer'
import { getAdminOwnerSendInfo, getInvoiceLast4 } from '../../helpers'

import { checkForCreditsPurchase } from './credits-purchase'
import { checkForPlanActivation } from './plan-activation'

export const handleInvoicePaid = async (event: Stripe.Event) => {
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

  await checkForCreditsPurchase(invoice, variant, variantTargetId)

  const { users, team, adminOwnerMemberships } = await getAdminOwnerSendInfo(
    variant,
    variantTargetId
  )

  await checkForPlanActivation(invoice, team, users)

  await notifySuccessfulPayment(
    invoice,
    users,
    team,
    adminOwnerMemberships,
    variant
  )
}

const notifySuccessfulPayment = async (
  invoice: Stripe.Invoice,
  users: UserAsPersonal[],
  team: Team | null,
  adminOwnerMemberships: Membership[],
  variant: 'TEAM' | 'USER'
) =>
  Promise.all(
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
