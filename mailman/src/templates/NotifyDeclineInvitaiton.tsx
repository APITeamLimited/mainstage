import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyDeclineInvitationData = {
  recipientFirstName: string
  targetFirstName: string
  targetLastName: string
  teamName: string
}

export const NotifyDeclineInvitation = (
  input: MailmanInput<NotifyDeclineInvitationData>
) => {
  const { data } = input

  return (
    <BaseMessageLayout
      title={notifyDeclineInvitationTitle(input)}
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
        {data.targetLastName} has declined the invite to join your team{' '}
        {data.teamName}. If your team member did this by mistake, you can resend
        an invite to them.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyDeclineInvitationText = ({
  data,
}: MailmanInput<NotifyDeclineInvitationData>) => {
  return `Hi ${data.recipientFirstName}, ${data.targetFirstName} ${data.targetLastName} has declined the invite to join your team ${data.teamName}.`
}

export const notifyDeclineInvitationTitle = ({
  data,
}: MailmanInput<NotifyDeclineInvitationData>) => {
  return `${data.targetFirstName} joined your team`
}
