import { NotifyInvoiceData } from '@apiteam/mailman'
import { Team } from '@prisma/client'
import axios from 'axios'
import type { Stripe } from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { dispatchEmail, DispatchEmailInput } from 'src/lib/mailman'
import { CustomerModel } from 'src/models'

import { customerIdentificationSchema } from '../customer'

import { getAdminOwnerSendInfo } from './helpers'

export const handleInvoiceCreatedUpdated = async (event: Stripe.Event) => {
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

  if (!invoice.invoice_pdf) {
    throw new Error('Invoice PDF not found')
  }

  if (!invoice.number) {
    throw new Error('Invoice number not found')
  }

  // Download invoice pdf into a base64 string
  const invoiceBase64 = await axios
    .get(invoice.invoice_pdf, {
      responseType: 'arraybuffer',
    })
    .then((response) => Buffer.from(response.data).toString('base64'))

  await Promise.all(
    users.map(async (user) => {
      const role = adminOwnerMemberships.find(
        (membership) => membership.userId === user.id
      )?.role

      if (variant === 'TEAM' && !role) {
        return
      }

      const mailmanInput: DispatchEmailInput<NotifyInvoiceData> = {
        template: 'notify-new-invoice',
        to: user.email,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
        data:
          variant === 'TEAM'
            ? {
                targetName: `${user.firstName} ${user.lastName}`,
                invoice,
                role: role as 'ADMIN' | 'OWNER',
                workspaceName: (team as Team).name,
                updated: event.type === 'invoice.updated',
              }
            : {
                targetName: `${user.firstName} ${user.lastName}`,
                invoice,
                role: 'OWN-ACCOUNT',
                workspaceName: undefined,
                updated: event.type === 'invoice.updated',
              },
        attachments: [
          {
            filename: `Invoice-${invoice.number}.pdf`,
            contentBase64: invoiceBase64,
            contentType: 'application/pdf',
          },
        ],
      }

      return dispatchEmail(mailmanInput)
    })
  )
}
