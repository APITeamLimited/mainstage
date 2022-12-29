import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyRemovedFromTeamData = {
  targetName: string
  teamName: string
  requestedToLeave?: boolean
}

export const NotifyRemovedFromTeam = (
  input: MailmanInput<NotifyRemovedFromTeamData>
) => {
  const {
    data: { targetName, teamName, requestedToLeave },
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
        {requestedToLeave ? (
          <>
            Hi {targetName}, you have been removed from the team {teamName} at
            your request
          </>
        ) : (
          <>
            Hi {targetName}, you have been removed from the team {teamName} by
            one of its admins or owner. If you have any questions, please
            contact them.
          </>
        )}
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyRemovedFromTeamText = ({
  data: { targetName, teamName, requestedToLeave },
}: MailmanInput<NotifyRemovedFromTeamData>) =>
  requestedToLeave
    ? `Hi ${targetName}, you have been removed from the team ${teamName} at your request`
    : `Hi ${targetName}, you have been removed from the team ${teamName} by one of its admins or owner. If you have any questions, please contact them.`

export const notifyRemovedFromTeamTitle = ({
  data: { teamName },
}: MailmanInput<NotifyRemovedFromTeamData>) =>
  `You have been removed from the team ${teamName}`
