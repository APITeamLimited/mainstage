import React from 'react'

import { Button, Link, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

type VerifyEmailData = {
  firstName: string
  verifyKey: string
}

export const VerifyEmail = (input: MailmanInput<VerifyEmailData>) => {
  const { data } = input

  const link = 'https://api.team/verify?email=' + data.verifyKey

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
        Hi {data.firstName}, thanks for signing up to APITeam. Please click the
        button below to verify your email address.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href={link}
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
        }}
      >
        <Link href={link}>{link}</Link>
      </Typography>
    </BaseMessageLayout>
  )
}

export const verifyEmailText = ({ data }: MailmanInput<VerifyEmailData>) => {
  const link = 'https://api.team/verify?email=' + data.verifyKey
  return `Hi ${data.firstName}, please verify your email by clicking the button below. If the button doesn't work, copy and paste the following link into your browser: ${link}`
}

export const verifyEmailTitle = ({ data }: MailmanInput<VerifyEmailData>) => {
  return `Verify your email ${data.firstName}`
}
