import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type VerifyEmailData = {
  firstName: string
  verifyCode: string
}

export const VerifyEmail = (input: MailmanInput<VerifyEmailData>) => {
  const {
    data: { firstName, verifyCode },
  } = input

  return (
    <BaseMessageLayout
      title={verifyEmailTitle(input)}
      messageType="SIGNUP_CONFIRMATION"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Verify your email
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {firstName}, thanks for signing up to APITeam. Please enter the
        following code to verify your email address. This code will expire in 15
        minutes.
      </Typography>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          textAlign: 'center',
          // Increase font spacing
          letterSpacing: 2,
        }}
      >
        {verifyCode}
      </Typography>
    </BaseMessageLayout>
  )
}

export const verifyEmailText = ({
  data: { firstName, verifyCode },
}: MailmanInput<VerifyEmailData>) => {
  return `Hi ${firstName}, please verify your email address by entering the following code: ${verifyCode}, this expires in 15 minutes.`
}

export const verifyEmailTitle = ({
  data: { firstName },
}: MailmanInput<VerifyEmailData>) => {
  return `Verify your APITeam email ${firstName}`
}
