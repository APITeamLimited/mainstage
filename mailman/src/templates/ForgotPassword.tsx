import React from 'react'

import { Button, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type ForgotPasswordData = {
  firstName: string
  resetLink: string
}

export const ForgotPassword = (input: MailmanInput<ForgotPasswordData>) => {
  const {
    data: { firstName, resetLink },
  } = input

  return (
    <BaseMessageLayout
      title={forgotPasswordTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Reset your password
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {firstName}, it looks like you&apos;ve forgotten your password.
        Please click the link below to reset your password. This link will
        expire in 15 minutes.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href={resetLink}
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Reset Password
      </Button>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Can&apos;t click the button? Copy and paste the following link into your
        browser <a href={resetLink}>{resetLink}</a>
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        If you did not request a password reset, please get in touch with our
        support team.
      </Typography>
    </BaseMessageLayout>
  )
}

export const forgotPasswordText = ({
  data: { firstName, resetLink },
}: MailmanInput<ForgotPasswordData>) => {
  return `Hi ${firstName}, it looks like you've forgotten your password. Please click the link below to reset your password. This link will expire in 15 minutes. ${resetLink}.`
}

export const forgotPasswordTitle = (_: MailmanInput<ForgotPasswordData>) =>
  'Password reset request'
