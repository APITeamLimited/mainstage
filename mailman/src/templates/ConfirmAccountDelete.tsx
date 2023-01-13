import React from 'react'

import { Alert, Button, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type ConfirmAccountDeleteData = {
  deleteLink: string
  targetName: string
}

export const confirmAccountDeleteMessageType = 'MANDATORY'

export const ConfirmAccountDelete = (
  input: MailmanInput<ConfirmAccountDeleteData>
) => {
  const {
    data: { deleteLink, targetName },
    to,
  } = input

  return (
    <BaseMessageLayout
      title={confirmAccountDeleteTitle(input)}
      messageType={confirmAccountDeleteMessageType}
    >
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you&apos;ve requested to delete your APITeam account
        with the email <strong>{to}</strong>. If you&apos;re sure you want to do
        this, please click the button below.
      </Typography>
      <Alert
        severity="error"
        sx={{ marginBottom: 2, alignSelf: 'center', justifyContent: 'center' }}
      >
        This action is irreversible and will delete all data associated with
        your account.
      </Alert>
      <div style={{ textAlign: 'center', width: '100%', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="error"
          href={deleteLink}
          sx={{
            alignSelf: 'center',
            marginBottom: 2,
          }}
        >
          Delete Account
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

export const confirmAccountDeleteText = ({
  data: { deleteLink, targetName },
  to,
}: MailmanInput<ConfirmAccountDeleteData>) =>
  `Hi ${targetName}, you've requested to delete your APITeam account with the email ${to}. If you're sure you want to do this, please click the link below. This action is irreversible and will delete all data associated with your account. ${deleteLink} If you did not initiate this, please contact us immediately.`

export const confirmAccountDeleteTitle = (
  _: MailmanInput<ConfirmAccountDeleteData>
) => 'Confirm delete of your APITeam account'
