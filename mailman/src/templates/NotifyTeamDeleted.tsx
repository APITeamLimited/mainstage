import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyTeamDeletedData = {
  targetName: string
  teamName: string
  wasOwner: boolean
}

export const NotifyTeamDeleted = (
  input: MailmanInput<NotifyTeamDeletedData>
) => {
  const {
    data: { wasOwner, teamName, targetName },
  } = input

  return (
    <BaseMessageLayout
      title={notifyTeamDeletedTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Team {teamName} has been deleted
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName},{' '}
        {wasOwner
          ? `your team ${teamName} has now been deleted`
          : `the team ${teamName} you were in was deleted by the owner`}
        .
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyTeamDeletedText = ({
  data: { wasOwner, teamName, targetName },
}: MailmanInput<NotifyTeamDeletedData>) =>
  `Hi ${targetName}, ${
    wasOwner
      ? `your team ${teamName} has now been deleted`
      : `the team ${teamName} you were in was deleted by the owner`
  }.`

export const notifyTeamDeletedTitle = ({
  data: { wasOwner },
}: MailmanInput<NotifyTeamDeletedData>) =>
  wasOwner
    ? 'Your team has been deleted'
    : 'A team you were in has been deleted'
