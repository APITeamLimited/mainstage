import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyTrialExpiringData = {
  firstName: string
  endTimeSeconds: number
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

export const NotifyTrialExpiring = (
  input: MailmanInput<NotifyTrialExpiringData>
) => {
  const {
    data: { role, workspaceName, firstName, endTimeSeconds },
  } = input

  const endDate = new Date(endTimeSeconds * 1000)

  const daysTillEnd = Math.ceil(
    (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <BaseMessageLayout
      title={notifyTrialExpiringTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        Hi {firstName},{' '}
        {role === 'OWNER'
          ? `your free trial for the workspace ${workspaceName} will expire in ${daysTillEnd} days`
          : role === 'ADMIN'
          ? `the free trial for the workspace ${workspaceName} where you are admin will expire in ${daysTillEnd} days`
          : `the free trial for your personal workspace will expire in ${daysTillEnd} days`}
        .
      </Typography>

      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        This is just a heads up that we will bill the primary card in this
        workspace on the {endDate.toDateString()}.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        If you&apos;re happy with APITeam (which we hope you are 😊)
        there&apos;s nothing to do. If you want to cancel your subscription, you
        can do so in the billing section of your workspace.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyTrialExpiringText = ({
  data: { role, workspaceName, firstName, endTimeSeconds },
}: MailmanInput<NotifyTrialExpiringData>) => {
  const endDate = new Date(endTimeSeconds * 1000)

  const daysTillEnd = Math.ceil(
    (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const line1 = `Hi ${firstName}, ${
    role === 'OWNER'
      ? `your free trial for the workspace ${workspaceName} will expire in ${daysTillEnd} days`
      : role === 'ADMIN'
      ? `the free trial for the workspace ${workspaceName} where you are admin will expire in ${daysTillEnd} days`
      : `the free trial for your personal workspace will expire in ${daysTillEnd} days`
  }.`

  const line2 = `This is just a heads up that we will bill the primary card in this workspace on the ${endDate.toDateString()}.`

  const line3 = `If you're happy with APITeam (which we hope you are 😊) there's nothing to do. If you want to cancel your subscription, you can do so in the billing section of your workspace.`

  return `${line1}\n\n${line2}\n\n${line3}`
}

export const notifyTrialExpiringTitle = (
  _: MailmanInput<NotifyTrialExpiringData>
) => 'Your APITeam trial will expire soon'
