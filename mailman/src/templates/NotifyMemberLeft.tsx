import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyMemberLeftData = {
  recipientFirstName: string
  targetFirstName: string
  targetLastName: string
  teamName: string
}

export const NotifyMemberLeft = (input: MailmanInput<NotifyMemberLeftData>) => {
  const { data } = input

  return (
    <BaseMessageLayout
      title={notifyMemberLeftTitle(input)}
      messageType="OPTIONAL_TEAM_UPDATES"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        {data.targetFirstName} left your team
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {data.recipientFirstName}, {data.targetFirstName}{' '}
        {data.targetLastName} left your team {data.teamName}.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyMemberLeftText = ({
  data,
}: MailmanInput<NotifyMemberLeftData>) =>
  `Hi ${data.recipientFirstName}, ${data.targetFirstName} ${data.targetLastName} left your team ${data.teamName}.`

export const notifyMemberLeftTitle = ({
  data,
}: MailmanInput<NotifyMemberLeftData>) => {
  return `${data.targetFirstName} left your team`
}
