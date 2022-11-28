import React from 'react'

import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyOldOwnerData = {
  targetName: string
  newOwnerName: string
  teamName: string
}

export const NotifyOldOwner = (input: MailmanInput<NotifyOldOwnerData>) => {
  const {
    data: { teamName, targetName, newOwnerName },
  } = input

  return (
    <BaseMessageLayout
      title={NotifyOldOwnerTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        You are no longer the owner of {teamName}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you are no longer the owner of {teamName}. The new
        owner is {newOwnerName}.
      </Typography>
    </BaseMessageLayout>
  )
}

export const NotifyOldOwnerText = ({
  data: { teamName, targetName, newOwnerName },
}: MailmanInput<NotifyOldOwnerData>) =>
  `Hi ${targetName}, you are no longer the owner of ${teamName}. The new owner is ${newOwnerName}.`

export const NotifyOldOwnerTitle = ({
  data: { teamName },
}: MailmanInput<NotifyOldOwnerData>) =>
  `You are no longer the owner of ${teamName}`
