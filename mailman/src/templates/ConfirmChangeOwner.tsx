import React from 'react'

import { Alert, Button, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type ConfirmChangeOwnerData = {
  newOwnerFirstname: string
  newOwnerLastname: string
  newOwnerEmail: string
  targetName: string
  changeOwnerLink: string
  teamName: string
}

export const confirmChangeOwnerMessageType = 'MANDATORY'

export const ConfirmChangeOwner = (
  input: MailmanInput<ConfirmChangeOwnerData>
) => {
  const {
    data: {
      newOwnerFirstname,
      newOwnerLastname,
      newOwnerEmail,
      targetName,
      changeOwnerLink,
      teamName,
    },
  } = input

  return (
    <BaseMessageLayout
      title={confirmChangeOwnerTitle(input)}
      messageType={confirmChangeOwnerMessageType}
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Confirm ownership transfer for {targetName}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you&apos;ve requested to transfer ownership of your
        team {teamName} to{' '}
        <strong>
          {newOwnerFirstname} {newOwnerLastname}
        </strong>{' '}
        ({newOwnerEmail}). If you&apos;re sure you want to do this, please click
        the button below.
      </Typography>
      <Alert
        severity="warning"
        sx={{ marginBottom: 2, alignSelf: 'center', justifyContent: 'center' }}
      >
        You will remain an admin of the team, but will no longer have owner
        rights
      </Alert>
      <div style={{ textAlign: 'center', width: '100%', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="error"
          href={changeOwnerLink}
          sx={{
            alignSelf: 'center',
            marginBottom: 2,
          }}
        >
          Transfer Ownership
        </Button>
      </div>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        If you did not initiate this, please contact us immediately.
      </Typography>
    </BaseMessageLayout>
  )
}

export const confirmChangeOwnerText = ({
  data: {
    newOwnerFirstname,
    newOwnerLastname,
    newOwnerEmail,
    targetName,
    changeOwnerLink,
    teamName,
  },
}: MailmanInput<ConfirmChangeOwnerData>) =>
  `Hi ${targetName}, you've requested to transfer ownership of your team ${teamName} to ${newOwnerFirstname} ${newOwnerLastname} (${newOwnerEmail}). If you're sure you want to do this, please click the link below. You will remain an admin of the team, but will no longer have owner rights. ${changeOwnerLink} If you did not initiate this, please contact us immediately.`

export const confirmChangeOwnerTitle = ({
  data: { teamName },
}: MailmanInput<ConfirmChangeOwnerData>) =>
  `Confirm ownership transfer for ${teamName}`
