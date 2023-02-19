import React from 'react'

import { Button, Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type TeamInvitationData = {
  inviteeFirstName: string | null
  inviterFirstName: string
  inviterLastName: string
  teamName: string
  acceptLink: string
  declineLink: string
  isExistingUser: boolean
}

export const TeamInvitation = (input: MailmanInput<TeamInvitationData>) => {
  const {
    data: {
      inviteeFirstName,
      inviterFirstName,
      inviterLastName,
      teamName,
      acceptLink,
      declineLink,
      isExistingUser,
    },
    to,
  } = input

  return (
    <BaseMessageLayout
      title={teamInvitationTitle(input)}
      messageType={isExistingUser ? 'MANDATORY' : 'NON_USER_INVITE'}
    >
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Hi {inviteeFirstName || to}, {inviterFirstName} {inviterLastName} has
        invited you to join their team {teamName} on APITeam. If you would like
        to join this team, please click the button below.
      </Typography>
      <div style={{ textAlign: 'center', width: '100%', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          href={acceptLink}
          sx={{
            marginBottom: 2,
            alignSelf: 'center',
          }}
        >
          Accept Invitation
        </Button>
      </div>
      <Typography
        variant="body1"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        If you do not wish to join this team, simply ignore this email or click
        decline below.
      </Typography>
      <div style={{ textAlign: 'center', width: '100%', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="error"
          href={declineLink}
          sx={{
            alignSelf: 'center',
          }}
        >
          Decline Invitation
        </Button>
      </div>
    </BaseMessageLayout>
  )
}

export const teamInvitationText = ({
  data: {
    inviteeFirstName,
    inviterFirstName,
    inviterLastName,
    teamName,
    declineLink,
  },
}: MailmanInput<TeamInvitationData>) => {
  return `Hi ${inviteeFirstName}, ${inviterFirstName} ${inviterLastName} has invited you to join their team ${teamName} on APITeam. If you would like to join this team, please click the button below. Accept Invitation If you do not wish to join this team, please click the link below, or simply ignore this email. ${declineLink}`
}

export const teamInvitationTitle = ({
  data: { teamName },
}: MailmanInput<TeamInvitationData>) => {
  return `You have been invited to join ${teamName} on APITeam`
}
