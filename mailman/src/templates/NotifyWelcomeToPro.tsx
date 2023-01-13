import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyWelcomeToProData = {
  targetName: string
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

export const NotifyWelcomeToPro = (
  input: MailmanInput<NotifyWelcomeToProData>
) => {
  const {
    data: { role, workspaceName, targetName },
  } = input

  return (
    <BaseMessageLayout
      title={notifyWelcomeToProTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName},{' '}
        {role === 'OWNER'
          ? `welcome to APITeam Pro! Your subscription for the workspace ${workspaceName} is now on the Pro plan`
          : role === 'ADMIN'
          ? `welcome to APITeam Pro! The subscription for the workspace ${workspaceName} where you are admin is now on the Pro plan`
          : `welcome to APITeam Pro! The subscription for your personal workspace is now on the Pro plan`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        You can now enjoy all the features of APITeam Pro.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Thanks for choosing APITeam!
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyWelcomeToProText = ({
  data: { role, workspaceName, targetName },
}: MailmanInput<NotifyWelcomeToProData>) => {
  const line1 = `Hi ${targetName}, ${
    role === 'OWNER'
      ? `welcome to APITeam Pro! Your subscription for the workspace ${workspaceName} is now on the Pro plan`
      : role === 'ADMIN'
      ? `welcome to APITeam Pro! The subscription for the workspace ${workspaceName} where you are admin is now on the Pro plan`
      : `welcome to APITeam Pro! The subscription for your personal workspace is now on the Pro plan`
  }`

  const line2 = `You can now enjoy all the features of APITeam Pro.`

  const line3 = `Thanks for choosing APITeam!`

  return `${line1}\n\n${line2}\n\n${line3}`
}

export const notifyWelcomeToProTitle = (
  _: MailmanInput<NotifyWelcomeToProData>
) => 'Welcome to APITeam Pro!'
