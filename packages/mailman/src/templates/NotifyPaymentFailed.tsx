import React from 'react'

import { Typography } from '@mui/material'
import type Stripe from 'stripe'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyPaymentFailedData = {
  targetName: string
  invoice: Stripe.Invoice
  last4: string | null
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

export const NotifyPaymentFailed = (
  input: MailmanInput<NotifyPaymentFailedData>
) => {
  const {
    data: { role, workspaceName, targetName, invoice, last4 },
  } = input

  const prettyPrice = `$${(invoice.amount_due / 100).toFixed(2)}`

  const description = invoice.description
    ? invoice.description
    : invoice.lines.data[0].description

  return (
    <BaseMessageLayout
      title={notifyPaymentFailedTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        Hi {targetName},{' '}
        {role === 'OWNER'
          ? `a payment on your workspace ${workspaceName} has failed`
          : role === 'ADMIN'
          ? `a payment on the workspace ${workspaceName} where you are admin has failed`
          : `a payment on your personal workspace has failed`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        {last4 ? (
          <>
            We tried to charge your card ending in <strong>{last4}</strong> for{' '}
            <strong>{description}</strong> but the payment failed. The charge
            was for <strong>{prettyPrice}</strong>. Invoice number was{' '}
            <strong>{invoice.number}</strong>.
          </>
        ) : (
          <>
            We tried to charge your card for <strong>{description}</strong> but
            the payment failed. The charge was for{' '}
            <strong>{prettyPrice}</strong>. Invoice number was{' '}
            <strong>{invoice.number}</strong>.
          </>
        )}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Invoice number is <strong>{invoice.number}</strong> and the total is{' '}
        <strong>${(invoice.amount_due / 100).toFixed(2)}</strong>.
      </Typography>
      {invoice.subscription && (
        <>
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

export const notifyPaymentFailedText = ({
  data: { role, workspaceName, targetName, invoice, last4 },
}: MailmanInput<NotifyPaymentFailedData>) => {
  const prettyPrice = `$${(invoice.amount_due / 100).toFixed(2)}`

  const description = invoice.description
    ? invoice.description
    : invoice.lines.data[0].description

  const line1 = `Hi ${targetName}, ${
    role === 'OWNER'
      ? `a payment on your workspace ${workspaceName} has failed`
      : role === 'ADMIN'
      ? `a payment on the workspace ${workspaceName} where you are admin has failed`
      : `a payment on your personal workspace has failed`
  }`

  const line2 = last4
    ? `We tried to charge your card ending in ${last4} for ${description} but the payment failed. The charge was for ${prettyPrice}. Invoice number was ${invoice.number}.`
    : `We tried to charge your card for ${description} but the payment failed. The charge was for ${prettyPrice}. Invoice number was ${invoice.number}.`

  const line3 = invoice.subscription
    ? `Please update your payment method on the billing dashboard to continue using your current plan's features. We will retry the payment in 3 days.`
    : undefined

  const line4 = invoice.subscription
    ? `Please note that your workspace will be downgraded to the free plan if you don't update your payment method within 3 days of the original payment failure.`
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

export const notifyPaymentFailedTitle = (
  _: MailmanInput<NotifyPaymentFailedData>
) => 'Payment Failed'
