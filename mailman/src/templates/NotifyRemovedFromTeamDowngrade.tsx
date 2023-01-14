import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyRemovedFromTeamDowngradeData = {
  targetName: string
  teamName: string
}

export const NotifyRemovedFromTeamDowngrade = (
  input: MailmanInput<NotifyRemovedFromTeamDowngradeData>
) => {
  const {
    data: { targetName, teamName },
  } = input

  return (
    <BaseMessageLayout
      title={notifyRemovedFromTeamDowngradeTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you have been removed from the team {teamName} because
        it has been downgraded to the free plan.
      </Typography>{' '}
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Free teams are limited in their number of members. If you would like to
        rejoin the team, please contact the team owner.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyRemovedFromTeamDowngradeText = ({
  data: { targetName, teamName },
}: MailmanInput<NotifyRemovedFromTeamDowngradeData>) => {
  const line1 = `Hi ${targetName}, you have been removed from the team ${teamName} because it has been downgraded to the free plan.`

  const line2 = `Free teams are limited in their number of members. If you would like to rejoin the team, please contact the team owner.`

  return [line1, line2].join('\n\n')
}

export const notifyRemovedFromTeamDowngradeTitle = ({
  data: { teamName },
}: MailmanInput<NotifyRemovedFromTeamDowngradeData>) =>
  `You have been removed from the team ${teamName}`
