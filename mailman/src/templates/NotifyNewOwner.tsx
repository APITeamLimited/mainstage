import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyNewOwnerData = {
  oldOwnerName: string
  targetName: string
  teamName: string
}

export const notifyNewOwnerMessageType = 'MANDATORY'

export const NotifyNewOwner = (input: MailmanInput<NotifyNewOwnerData>) => {
  const {
    data: { teamName, targetName, oldOwnerName },
  } = input

  return (
    <BaseMessageLayout
      title={NotifyNewOwnerTitle(input)}
      messageType={notifyNewOwnerMessageType}
    >
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you have been made the owner of {teamName} by the old
        owner {oldOwnerName}.
      </Typography>
    </BaseMessageLayout>
  )
}

export const NotifyNewOwnerText = ({
  data: { teamName, targetName, oldOwnerName },
}: MailmanInput<NotifyNewOwnerData>) =>
  `Hi ${targetName}, you have been made the owner of ${teamName} by the old owner ${oldOwnerName}.`

export const NotifyNewOwnerTitle = ({
  data: { teamName },
}: MailmanInput<NotifyNewOwnerData>) => `You are now the owner of ${teamName}`
