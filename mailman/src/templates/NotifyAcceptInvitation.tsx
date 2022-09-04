import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

type NotifyAcceptInvitationData = {
  recipientFirstName: string
  targetFirstName: string
  targetLastName: string
  teamName: string
}

export const NotifyAcceptInvitation = (
  input: MailmanInput<NotifyAcceptInvitationData>
) => {
  const { data } = input

  return (
    <BaseMessageLayout
      title={notifyAcceptInvitationTitle(input)}
      messageType="OPTIONAL_TEAM_UPDATES"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        {data.targetFirstName} joined your team
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {data.recipientFirstName}, {data.targetFirstName}{' '}
        {data.targetLastName} has accepted the invite to join your team{' '}
        {data.teamName}.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyAcceptInvitationText = ({
  data,
}: MailmanInput<NotifyAcceptInvitationData>) => {
  return `Hi ${data.recipientFirstName}, ${data.targetFirstName} ${data.targetLastName} has accepted the invite to join your team ${data.teamName}.`
}

export const notifyAcceptInvitationTitle = ({
  data,
}: MailmanInput<NotifyAcceptInvitationData>) => {
  return `${data.targetFirstName} joined your team`
}
