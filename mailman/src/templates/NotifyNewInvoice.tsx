import React from 'react'

import { Typography } from '@mui/material'
import type Stripe from 'stripe'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyNewInvoiceData = {
  targetName: string
  invoice: Stripe.Invoice
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

export const NotifyNewInvoice = (input: MailmanInput<NotifyNewInvoiceData>) => {
  const {
    data: { role, workspaceName, targetName, invoice },
  } = input

  return (
    <BaseMessageLayout
      title={notifyNewInvoiceTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        New APITeam invoice {invoice.number} for{' '}
        {role === 'OWN-ACCOUNT' ? 'your account' : workspaceName}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName},{' '}
        {role === "OWNER"
          ? `you have a new invoice for the subscription of the workspace ${workspaceName}`
          : role === 'ADMIN'
          ? `you have a new invoice for the subscription of the workspace ${workspaceName} where you are admin`
          : `you have a new invoice for the subscription of your personal workspace`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Invoice Date: {new Date(invoice.created * 1000).toLocaleDateString()}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Invoice Number: {invoice.number}
      </Typography>
      {invoice.lines.data.map((line) => {
        const prettyAmount = `$${(line.amount / 100).toFixed(2)}`

        return (
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
            }}
            key={line.id}
          >
            {line.subscription}
            {line.description} - {prettyAmount}
          </Typography>
        )
      })}
    </BaseMessageLayout>
  )
}

export const notifyNewInvoiceText = ({
  data: { role, workspaceName, targetName },
}: MailmanInput<NotifyNewInvoiceData>) => {
  const line1 = `Hi ${targetName}, ${
    role === "OWNER"
      ? `your subscription for the workspace ${workspaceName} has been downgraded to the free plan`
      : role === 'ADMIN'
      ? `the subscription for the workspace ${workspaceName} where you are admin has been downgraded to the free plan`
      : `the subscription for your personal workspace has been downgraded to the free plan`
  }`

  const line2 = `Feel free to carry on enjoy using APITeam!`

  return `${line1}\n\n${line2}`
}

export const notifyNewInvoiceTitle = ({
  data: { role, workspaceName, invoice },
}: MailmanInput<NotifyNewInvoiceData>) =>
  `New APITeam invoice ${invoice.number} for ${
    role === 'OWN-ACCOUNT' ? 'your account' : workspaceName
  }`
