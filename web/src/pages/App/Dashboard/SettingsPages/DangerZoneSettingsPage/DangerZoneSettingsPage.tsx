import { useMemo } from 'react'

import { Workspace } from '@apiteam/types/src'
import { Stack } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { SETTINGS_TABS } from '..'

import { DeleteAccountCard } from './DeleteAccountCard'
import { DeleteTeamCard } from './DeleteTeamCard'
import { LeaveTeamCard } from './LeaveTeamCard'
import { TransferOwnershipCard } from './TransferOwnershipCard'

type DangerZoneSettingsTabProps = {
  workspaceInfo: Workspace
}

const DangerZoneSettingsTab = ({
  workspaceInfo,
}: DangerZoneSettingsTabProps) => {
  const isTeam = useMemo(
    () => workspaceInfo.scope.variant === 'TEAM',
    [workspaceInfo]
  )

  return (
    <Stack spacing={4}>
      {isTeam ? (
        <>
          {workspaceInfo.scope.role === 'OWNER' ? (
            <>
              <TransferOwnershipCard workspaceInfo={workspaceInfo} />
              <DeleteTeamCard workspaceInfo={workspaceInfo} />
            </>
          ) : (
            <>
              <LeaveTeamCard workspaceInfo={workspaceInfo} />
            </>
          )}
        </>
      ) : (
        <>
          <DeleteAccountCard workspaceInfo={workspaceInfo} />
        </>
      )}
    </Stack>
  )
}

export const DangerZoneSettingsPage = () => {
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
  if (!workspaceInfo) return null

  return (
    <>
      <MetaTags title={prettyType} />
      <DashboardPageFrame title={prettyType}>
        <SideTabManager basePath={basePath} possibleTabs={SETTINGS_TABS}>
          <DangerZoneSettingsTab workspaceInfo={workspaceInfo} />
        </SideTabManager>
      </DashboardPageFrame>
    </>
  )
}

export default DangerZoneSettingsPage
