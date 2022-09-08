import React from 'react'

import { Button, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type SignupWelcomeData = {
  firstName: string
  dashboardLink: string
}

export const SignupWelcome = (input: MailmanInput<SignupWelcomeData>) => {
  const {
    data: { firstName, dashboardLink },
  } = input

  return (
    <BaseMessageLayout
      title={signupWelcomeTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Welcome to APITeam, {firstName}!
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {firstName}, welcome to APITeam! We&apos;re excited to have you on
        board.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        To get started, head over to the dashboard:
      </Typography>
      <Button
        variant="contained"
        color="success"
        href={dashboardLink}
        sx={{
          textAlign: 'center',
        }}
      >
        Go to Dashboard
      </Button>
    </BaseMessageLayout>
  )
}

export const signupWelcomeText = ({
  data: { firstName, dashboardLink },
}: MailmanInput<SignupWelcomeData>) => {
  return `Hi ${firstName}, welcome to APITeam! We're excited to have you on board. To get started, head over to the dashboard: ${dashboardLink}`
}

export const signupWelcomeTitle = ({
  data: { firstName },
}: MailmanInput<SignupWelcomeData>) => {
  return `Welcome to APITeam, ${firstName}!`
}
