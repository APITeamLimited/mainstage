import React from 'react'

import { Alert, Button, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type ConfirmTeamDeleteData = {
  deleteLink: string
  targetName: string
  teamName: string
}

export const ConfirmTeamDelete = (
  input: MailmanInput<ConfirmTeamDeleteData>
) => {
  const {
    data: { deleteLink, teamName, targetName },
  } = input

  return (
    <BaseMessageLayout
      title={confirmTeamDeleteTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Confirm delete of team {teamName}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {targetName}, you are receiving this email because you are the owner
        of {teamName} and have requested to delete this team. If you would like
        to delete this team, please click the button below.
      </Typography>
      <Alert
        severity="error"
        sx={{ marginBottom: 2, alignSelf: 'center', justifyContent: 'center' }}
      >
        This action is irreversible and will delete all data associated with
        this team.
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
          Delete Team
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

export const confirmTeamDeleteText = ({
  data: { deleteLink, teamName, targetName },
}: MailmanInput<ConfirmTeamDeleteData>) =>
  `Hi ${targetName}, you are receiving this email because you are the owner of ${teamName} and have requested to delete this team. If you would like to delete this team, please click the link below. This action is irreversible and will delete all data associated with this team. ${deleteLink}`

export const confirmTeamDeleteTitle = ({
  data: { teamName },
}: MailmanInput<ConfirmTeamDeleteData>) =>
  `Confirm delete of your team ${teamName}`
