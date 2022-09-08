import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyPasswordResetData = {
  firstName: string
}

export const NotifyPasswordReset = (
  input: MailmanInput<NotifyPasswordResetData>
) => {
  const {
    data: { firstName },
  } = input

  return (
    <BaseMessageLayout
      title={notifyPasswordResetTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        You password has been changed
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {firstName}, your password was just changed. If you did not change
        your password, please contact us immediately.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyPasswordResetText = ({
  data: { firstName },
}: MailmanInput<NotifyPasswordResetData>) => {
  return `Hi ${firstName}, your password was just changed. If you did not change your password, please contact us immediately.`
}

export const notifyPasswordResetTitle = (
  _: MailmanInput<NotifyPasswordResetData>
) => 'Your password has been changed'
