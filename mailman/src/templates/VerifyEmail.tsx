import React from 'react'

import { Button, Link, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type VerifyEmailData = {
  firstName: string
  verifyLink: string
}

export const VerifyEmail = (input: MailmanInput<VerifyEmailData>) => {
  const {
    data: { firstName, verifyLink },
  } = input

  return (
    <BaseMessageLayout title={verifyEmailTitle(input)} messageType="MANDATORY">
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
        Hi {firstName}, thanks for signing up to APITeam. Please click the
        button below to verify your email address.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href={verifyLink}
        sx={{
          marginBottom: 2,
          alignSelf: 'center',
        }}
      >
        Verify Email
      </Button>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        If that doesn&apos;t work, copy and paste the following link into your
        browser:
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          overflowWrap: 'break-word',
        }}
      >
        <a href={verifyLink}>{verifyLink}</a>
      </Typography>
    </BaseMessageLayout>
  )
}

export const verifyEmailText = ({
  data: { firstName, verifyLink },
}: MailmanInput<VerifyEmailData>) => {
  return `Hi ${firstName}, please verify your email by clicking the button below. If the button doesn't work, copy and paste the following link into your browser: ${verifyLink}`
}

export const verifyEmailTitle = ({
  data: { firstName },
}: MailmanInput<VerifyEmailData>) => {
  return `Verify your APITeam email ${firstName}`
}
