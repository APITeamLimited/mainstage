import React from 'react'

import { TeamRole } from '@apiteam/types'
import { Typography } from '@mui/material'

import { MailmanInput } from '..'
import { BaseMessageLayout } from '../layouts'

export type NotifyNewRoleData = {
  newRole: TeamRole
  targetName: string
  teamName: string
}

export const NotifyNewRole = (input: MailmanInput<NotifyNewRoleData>) => {
  const {
    data: { teamName, newRole, targetName },
  } = input

  const prettyRole = newRole.charAt(0) + newRole.slice(1).toLowerCase()

  return (
    <BaseMessageLayout
      title={notifyNewRoleTitle(input)}
      messageType="MANDATORY"
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: 'center',
        }}
      >
        Your team role has been updated to {prettyRole}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
        }}
      >
        Hi {targetName}, your role in {teamName} has been updated to{' '}
        {prettyRole}. If you have any questions, please contact your team&apos;s
        admin or owner.
      </Typography>
    </BaseMessageLayout>
  )
}

export const notifyNewRoleText = ({
  data: { teamName, newRole, targetName },
}: MailmanInput<NotifyNewRoleData>) => {
  const prettyRole = newRole.charAt(0) + newRole.slice(1).toLowerCase()
  return `Hi ${targetName}, your role in ${teamName} has been updated to ${prettyRole}. If you have any questions, please contact your team's admin or owner.`
}

export const notifyNewRoleTitle = ({
  data: { teamName, newRole },
}: MailmanInput<NotifyNewRoleData>) => {
  const prettyRole = newRole.charAt(0) + newRole.slice(1).toLowerCase()
  return `Your role in ${teamName} has been updated to ${prettyRole}`
}
