import { useMemo, useState } from 'react'

import { Stack, Typography, useTheme, Box } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { CustomTabs } from 'src/components/app/CustomTabs'
import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { SETTINGS_TABS } from '..'

import { AddNewMember } from './AddNewMember'
import { CallToCreateTeam } from './CallToCreateTeam'
import { ManagePendingInvitations } from './ManagePendingInvitations'
import { ManageTeamMembers } from './ManageTeamMembers'
import { MembersInfoProvider } from './MembersInfoProvider'

type MembersSettingsTabProps = {
  teamId: string
}

export const MEMBERS_CARD_HEIGHT = 400

const MembersSettingsTab = ({ teamId }: MembersSettingsTabProps) => {
  const theme = useTheme()
  const [membersTabIndex, setMembersTabIndex] = useState(0)

  return (
    <MembersInfoProvider teamId={teamId}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Members
          </Typography>
          <Typography variant="body1" color={theme.palette.text.secondary}>
            Manage your team members and their roles.
          </Typography>
        </Box>
        <AddNewMember />
        <Box>
          <CustomTabs
            value={membersTabIndex}
            onChange={setMembersTabIndex}
            names={['Members', 'Invites']}
            borderBottom
          />
        </Box>
        {membersTabIndex === 0 && <ManageTeamMembers />}
        {membersTabIndex === 1 && <ManagePendingInvitations teamId={teamId} />}
      </Stack>
    </MembersInfoProvider>
  )
}

export const MembersSettingsPage = () => {
  const basePath = useMemo(() => routes.settingsWorkspace(), [])
  const workspaceInfo = useWorkspaceInfo()

  const prettyType = useMemo(() => {
    if (!workspaceInfo) return null
    if (workspaceInfo.scope?.variant === 'USER') {
      return 'Personal Account Settings'
    } else {
      return 'Team Settings'
    }
  }, [workspaceInfo])

  if (!prettyType) return null
  if (!workspaceInfo?.scope) return null

  return (
    <>
      <MetaTags title={prettyType} />
      <DashboardPageFrame title={prettyType}>
        <SideTabManager basePath={basePath} possibleTabs={SETTINGS_TABS}>
          {workspaceInfo.scope.variant === 'USER' ? (
            <CallToCreateTeam />
          ) : (
            <MembersSettingsTab teamId={workspaceInfo.scope.variantTargetId} />
          )}
        </SideTabManager>
      </DashboardPageFrame>
    </>
  )
}

export default MembersSettingsPage
