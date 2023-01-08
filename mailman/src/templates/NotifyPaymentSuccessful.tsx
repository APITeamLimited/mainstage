import React from 'react'

import { Typography } from '@mui/material'
import type Stripe from 'stripe'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyPaymentSuccessfulData = {
  targetName: string
  invoice: Stripe.Invoice
  last4: string
} & (
  | {
      role: 'OWN-ACCOUNT'
      workspaceName: undefined
    }
  | {
      role: "OWNER" | 'ADMIN'
      workspaceName: string
    }
)

export const NotifyPaymentSuccessful = (
  input: MailmanInput<NotifyPaymentSuccessfulData>
) => {
  const {
    data: { role, workspaceName, targetName, invoice, last4 },
  } = input

  const prettyPrice = `$${(invoice.amount_due / 100).toFixed(2)}`

  return (
    <BaseMessageLayout
      title={notifyPaymentSuccessfulTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        APITeam Payment Successful
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName},{' '}
        {role === "OWNER"
          ? `payment on your workspace ${workspaceName} has succeeded`
          : role === 'ADMIN'
          ? `payment on the workspace ${workspaceName} where you are admin has succeeded`
          : `payment on your personal workspace has succeeded`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Payment successful for <strong>{invoice.description}</strong>. We
        successfully charged your card ending in <strong>{last4}</strong> for{' '}
        <strong>${prettyPrice}</strong>. Invoice number was{' '}
        <strong>${invoice.number}</strong>.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Thanks for your payment and using APITeam!
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyPaymentSuccessfulText = ({
  data: { role, workspaceName, targetName, invoice, last4 },
}: MailmanInput<NotifyPaymentSuccessfulData>) => {
  const prettyPrice = `$${(invoice.amount_due / 100).toFixed(2)}`

  const line1 = `Hi ${targetName}, ${
    role === "OWNER"
      ? `payment on your workspace ${workspaceName} has succeeded`
      : role === 'ADMIN'
      ? `payment on the workspace ${workspaceName} where you are admin has succeeded`
      : `payment on your personal workspace has succeeded`
  }`

  const line2 = `Payment successful for ${invoice.description}. We successfully charged your card ending in ${last4} for ${prettyPrice}. Invoice number was ${invoice.number}.`

  const line3 = 'Thanks for your payment and using APITeam!'

  return [line1, line2, line3].join('\n\n')
}

export const notifyPaymentSuccessfulTitle = (
  _: MailmanInput<NotifyPaymentSuccessfulData>
) => 'APITeam Payment Successful'
