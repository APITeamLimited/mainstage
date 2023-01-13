import React from 'react'

import { Typography } from '@mui/material'
import type Stripe from 'stripe'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyInvoiceData = {
  targetName: string
  invoice: Stripe.Invoice
  updated: boolean
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

export const NotifyInvoice = (input: MailmanInput<NotifyInvoiceData>) => {
  const {
    data: { role, workspaceName, targetName, invoice, updated },
  } = input

  return (
    <BaseMessageLayout
      title={notifyInvoiceTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        {updated ? 'Updated' : 'New'} APITeam invoice {invoice.number} for{' '}
        {role === 'OWN-ACCOUNT' ? 'your account' : workspaceName}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName},{' '}
        {role === 'OWNER'
          ? `you have ${
              updated ? 'an updated' : 'a new'
            } invoice for the subscription on your workspace ${workspaceName}.`
          : role === 'ADMIN'
          ? `you have ${
              updated ? 'an updated' : 'a new'
            } invoice for the subscription of the workspace ${workspaceName} where you are admin.`
          : `you have ${
              updated ? 'an updated' : 'a new'
            } invoice for the subscription of your personal workspace.`}
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
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Please see the attached PDF for more details.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyInvoiceText = ({
  data: { role, workspaceName, targetName, invoice, updated },
}: MailmanInput<NotifyInvoiceData>) => {
  const line1 = `Hi ${targetName},`

  const line2 =
    role === 'OWNER'
      ? `you have ${
          updated ? 'an updated' : 'a new'
        } invoice for the subscription on your workspace ${workspaceName}.`
      : role === 'ADMIN'
      ? `you have ${
          updated ? 'an updated' : 'a new'
        } invoice for the subscription of the workspace ${workspaceName} where you are admin.`
      : `you have ${
          updated ? 'an updated' : 'a new'
        } invoice for the subscription of your personal workspace.`

  const line3 = `Invoice Date: ${new Date(
    invoice.created * 1000
  ).toLocaleDateString()}`

  const line4 = `Invoice Number: ${invoice.number}`

  const line5 = `Please see the attached PDF for more details.`

  return [line1, line2, line3, line4, line5].join('\n\n')
}

export const notifyInvoiceTitle = ({
  data: { role, workspaceName, invoice, updated },
}: MailmanInput<NotifyInvoiceData>) =>
  `${updated ? 'Updated' : 'New'} APITeam invoice ${invoice.number} for ${
    role === 'OWN-ACCOUNT' ? 'your account' : workspaceName
  }`
