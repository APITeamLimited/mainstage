import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyRemovedFromTeamData = {
  targetName: string
  teamName: string
}

export const NotifyRemovedFromTeam = (
  input: MailmanInput<NotifyRemovedFromTeamData>
) => {
  const {
    data: { targetName, teamName },
  } = input

  return (
    <BaseMessageLayout
      title={notifyRemovedFromTeamTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        You have been removed from the team {teamName}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you have been removed from the team {teamName} by one
        of its admins or owner. If you have any questions, please contact them.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyRemovedFromTeamText = ({
  data: { targetName, teamName },
}: MailmanInput<NotifyRemovedFromTeamData>) =>
  `Hi ${targetName}, you have been removed from the team ${teamName} by one of its admins or owner. If you have any questions, please contact them.`

export const notifyRemovedFromTeamTitle = ({
  data: { teamName },
}: MailmanInput<NotifyRemovedFromTeamData>) =>
  `You have been removed from the team ${teamName}`
