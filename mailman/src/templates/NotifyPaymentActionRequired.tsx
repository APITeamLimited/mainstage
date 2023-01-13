import React from 'react'

import { Typography } from '@mui/material'
import type Stripe from 'stripe'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyPaymentActionRequiredData = {
  targetName: string
  invoice: Stripe.Invoice
  last4: string
} & (
  | {
      role: 'OWN-ACCOUNT'
      workspaceName: undefined
    }
  | {
      role: 'OWNER' | 'ADMIN'
      workspaceName: string
    }
)

export const NotifyPaymentActionRequired = (
  input: MailmanInput<NotifyPaymentActionRequiredData>
) => {
  const {
    data: { role, workspaceName, targetName, invoice, last4 },
  } = input

  const prettyPrice = `$${(invoice.amount_due / 100).toFixed(2)}`

  return (
    <BaseMessageLayout
      title={notifyPaymentActionRequiredTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName}, payment action is required for{' '}
        {role === 'OWNER'
          ? `your workspace ${workspaceName}`
          : role === 'ADMIN'
          ? `the workspace ${workspaceName} where you are admin`
          : 'your personal workspace'}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        We tried to charge your card ending in <strong>{last4}</strong> for{' '}
        <strong>{invoice.description}</strong> but the payment failed. The
        charge was for <strong>{prettyPrice}</strong>. Invoice number was{' '}
        <strong>{invoice.number}</strong>.
      </Typography>
      {invoice.subscription && (
        <>
          {' '}
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
            }}
          >
            Please update your payment method on the billing dashboard to
            continue using your current plan&apos;s features. We will retry the
            payment in 3 days.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
            }}
          >
            Please note that your workspace will be downgraded to the free plan
            if you don&apos;t update your payment method within 3 days of the
            original payment failure.
          </Typography>
        </>
      )}
    </BaseMessageLayout>
  )
}

export const notifyPaymentActionRequiredText = ({
  data: { role, workspaceName, targetName, invoice, last4 },
}: MailmanInput<NotifyPaymentActionRequiredData>) => {
  const prettyPrice = `$${(invoice.amount_due / 100).toFixed(2)}`

  const line1 = `Hi ${targetName}, payment action is required for ${
    role === 'OWNER'
      ? `your workspace ${workspaceName}`
      : role === 'ADMIN'
      ? `the workspace ${workspaceName} where you are admin`
      : 'your personal workspace'
  }`

  const line2 = `We tried to charge your card ending in ${last4} for ${invoice.description} but the payment failed. The charge was for ${prettyPrice}. Invoice number was ${invoice.number}.`

  const line3 = invoice.subscription
    ? "Please update your payment method on the billing dashboard to continue using your current plan's features. We will retry the payment in 3 days."
    : undefined

  const line4 = invoice.subscription
    ? "Please note that your workspace will be downgraded to the free plan if you don't update your payment method within 3 days of the original payment failure."
    : undefined

  const lines = [line1, line2]

  if (line3) {
    lines.push(line3)
  }

  if (line4) {
    lines.push(line4)
  }

  return lines.join('\n\n')
}

export const notifyPaymentActionRequiredTitle = (
  _: MailmanInput<NotifyPaymentActionRequiredData>
) => 'APITeam Payment Failed'
