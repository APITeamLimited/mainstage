import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyDeclineInvitationData = {
  recipientFirstName: string
  targetEmail: string
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
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {data.recipientFirstName}, {data.targetEmail} has declined the invite
        to join your team {data.teamName}. If you think this was done by
        mistake, you can resend an invite to them.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyDeclineInvitationText = ({
  data,
}: MailmanInput<NotifyDeclineInvitationData>) => {
  return `Hi ${data.recipientFirstName}, ${data.targetEmail} has declined the invite to join your team ${data.teamName}. If your think this was done by mistake, you can resend an invite to them.`
}

export const notifyDeclineInvitationTitle = ({
  data,
}: MailmanInput<NotifyDeclineInvitationData>) =>
  `${data.targetEmail}, declined to join ${data.teamName}`
