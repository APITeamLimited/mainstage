import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyDowngradeAtPeriodEndData = {
  targetName: string
  endDateSeconds: number
  verbosePlanName: string
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

export const NotifyDowngradeAtPeriodEnd = (
  input: MailmanInput<NotifyDowngradeAtPeriodEndData>
) => {
  const {
    data: { role, workspaceName, targetName, endDateSeconds, verbosePlanName },
  } = input

  const endDate = new Date(endDateSeconds * 1000)

  return (
    <BaseMessageLayout
      title={notifyDowngradeAtPeriodEndTitle(input)}
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
          ? `the subscription for ${verbosePlanName} in your workspace ${workspaceName} has been cancelled.`
          : role === 'ADMIN'
          ? `the subscription for ${verbosePlanName} in the workspace ${workspaceName} where you are admin has been cancelled.`
          : `the subscription for ${verbosePlanName} in your personal workspace has been cancelled.`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Your subscription will remain active until the end of the billing period
        on the <strong>{endDate.toDateString()}</strong>.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        After this, you will be downgraded to the free plan.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Thanks for using APITeam!
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyDowngradeAtPeriodEndText = ({
  data: { role, workspaceName, targetName, endDateSeconds, verbosePlanName },
}: MailmanInput<NotifyDowngradeAtPeriodEndData>) => {
  const endDate = new Date(endDateSeconds * 1000)

  const line1 = `Hi ${targetName}, ${
    role === 'OWNER'
      ? `the subscription for ${verbosePlanName} in your workspace ${workspaceName} has been cancelled.`
      : role === 'ADMIN'
      ? `the subscription for ${verbosePlanName} in the workspace ${workspaceName} where you are admin has been cancelled.`
      : `the subscription for ${verbosePlanName} in your personal workspace has been cancelled.`
  }`

  const line2 = `Your subscription will remain active until the end of the billing period on the ${endDate.toDateString()}.`

  const line3 = `After this, you will be downgraded to the free plan.`

  const line4 = `Thanks for using APITeam!`

  return [line1, line2, line3, line4].join('\n\n')
}

export const notifyDowngradeAtPeriodEndTitle = ({
  data: { verbosePlanName },
}: MailmanInput<NotifyDowngradeAtPeriodEndData>) =>
  `Cancellation of your ${verbosePlanName} plan`
