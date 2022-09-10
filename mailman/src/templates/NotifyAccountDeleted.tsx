import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyAccountDeletedData = {
  targetName: string
}

export const NotifyAccountDeleted = (
  input: MailmanInput<NotifyAccountDeletedData>
) => {
  const {
    data: { targetName },
    to,
  } = input

  return (
    <BaseMessageLayout
      title={notifyAccountDeletedTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Your APITeam account has been deleted
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {targetName}, your APITeam account with the email{' '}
        <strong>{to}</strong> has now been deleted, along with all data we store
        about you. If you have any questions, please don&apos;t hesitate to
        reach out to us.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Thanks for trying APITeam out!
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyAccountDeletedText = ({
  data: { targetName },
  to,
}: MailmanInput<NotifyAccountDeletedData>) =>
  `Hi ${targetName}, your APITeam account with the email ${to} has now been deleted, along with all data we store about you. If you have any questions, please don't hesitate to reach out to us. Thanks for trying APITeam out!`

export const notifyAccountDeletedTitle = (
  _: MailmanInput<NotifyAccountDeletedData>
) => 'Your APITeam account has been deleted'
