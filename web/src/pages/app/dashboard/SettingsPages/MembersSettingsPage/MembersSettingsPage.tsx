import { useMemo, useState } from 'react'

import { Stack, Typography, useTheme, Box, Divider } from '@mui/material'

import { routes } from '@redwoodjs/router'

import { CustomTabs } from 'src/components/app/CustomTabs'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { Headline } from 'src/pages/splash/components/Headline'

import { SETTINGS_TABS } from '..'

import { AddNewMember } from './AddNewMember'
import { CallToCreateTeam } from './CallToCreateTeam'
import { ManagePendingInvitations } from './ManagePendingInvitations'
import { ManageTeamMembers } from './ManageTeamMembers'

type MembersSettingsTabProps = {
  teamId: string
}

export const MEMBERS_CARD_HEIGHT = 400

const MembersSettingsTab = ({ teamId }: MembersSettingsTabProps) => {
  const theme = useTheme()
  const [membersTabIndex, setMembersTabIndex] = useState(0)
  const [invitionsSentCount, setInvitionsSentCount] = useState(0)

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Members
        </Typography>
        <Typography variant="body1" color={theme.palette.text.secondary}>
          Manage your team members and their roles.
        </Typography>
      </Box>
      <AddNewMember
        incrementInvitationsCount={() =>
          setInvitionsSentCount(invitionsSentCount + 1)
        }
      />
      <Box>
        <CustomTabs
          value={membersTabIndex}
          onChange={setMembersTabIndex}
          names={['Members', 'Invites']}
          borderBottom
        />
      </Box>
      {membersTabIndex === 0 && <ManageTeamMembers teamId={teamId} />}
      {membersTabIndex === 1 && (
        <ManagePendingInvitations
          invitionsSentCount={invitionsSentCount}
          teamId={teamId}
        />
      )}
    </Stack>
  )
}

export const MembersSettingsPage = () => {
  const basePath = useMemo(() => routes.settingsWorkspace(), [])
  const workspaceInfo = useWorkspaceInfo()

  const prettyType = useMemo(() => {
    if (!workspaceInfo) return null
    if (workspaceInfo.scope?.variant === 'USER') {
      return 'Personal Settings'
    } else {
      return 'Team Settings'
    }
  }, [workspaceInfo])

  if (!prettyType) return null
  if (!workspaceInfo?.scope) return null

  return (
    <Stack spacing={6}>
      <Box
        sx={{
          top: '-1em',
          position: 'relative',
        }}
      >
        <Headline headline={prettyType} />
        <Divider
          sx={{
            marginTop: 6,
          }}
        />
      </Box>
      <SideTabManager basePath={basePath} possibleTabs={SETTINGS_TABS}>
        {workspaceInfo.scope.variant === 'USER' ? (
          <CallToCreateTeam />
        ) : (
          <MembersSettingsTab teamId={workspaceInfo.scope.variantTargetId} />
        )}
      </SideTabManager>
    </Stack>
  )
}

export default MembersSettingsPage
