import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyDowngradeFreeTierData = {
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

export const NotifyDowngradeFreeTier = (
  input: MailmanInput<NotifyDowngradeFreeTierData>
) => {
  const {
    data: { role, workspaceName, targetName },
  } = input

  return (
    <BaseMessageLayout
      title={notifyDowngradeFreeTierTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        Hi {targetName},{' '}
        {role === 'OWNER'
          ? `your subscription for the workspace ${workspaceName} has been downgraded to the free plan`
          : role === 'ADMIN'
          ? `the subscription for the workspace ${workspaceName} where you are admin has been downgraded to the free plan`
          : `the subscription for your personal workspace has been downgraded to the free plan`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Feel free to carry on enjoy using APITeam!
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyDowngradeFreeTierText = ({
  data: { role, workspaceName, targetName },
}: MailmanInput<NotifyDowngradeFreeTierData>) => {
  const line1 = `Hi ${targetName}, ${
    role === 'OWNER'
      ? `your subscription for the workspace ${workspaceName} has been downgraded to the free plan`
      : role === 'ADMIN'
      ? `the subscription for the workspace ${workspaceName} where you are admin has been downgraded to the free plan`
      : `the subscription for your personal workspace has been downgraded to the free plan`
  }`

  const line2 = `Feel free to carry on enjoy using APITeam!`

  return `${line1}\n\n${line2}`
}

export const notifyDowngradeFreeTierTitle = (
  _: MailmanInput<NotifyDowngradeFreeTierData>
) => 'Your APITeam workspace has been downgraded'
