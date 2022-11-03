import { useMemo } from 'react'

import { Workspace } from '@apiteam/types/src'
import { Box, Divider, Stack } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'

import { SETTINGS_TABS } from '..'

import { ChangePersonalSlugCard } from './ChangePersonalSlugCard'
import { ChangeTeamNameCard } from './ChangeTeamNameCard'
import { ChangeTeamSlugCard } from './ChangeTeamSlugCard'

type GeneralSettingsTabProps = {
  workspaceInfo: Workspace
}

const GeneralSettingsTab = ({ workspaceInfo }: GeneralSettingsTabProps) => {
  const isTeam = useMemo(
    () => workspaceInfo.scope.variant === 'TEAM',
    [workspaceInfo]
  )

  const isAtLeastAdmin = useMemo(
    () =>
      isTeam &&
      (workspaceInfo.scope.role === 'ADMIN' ||
        workspaceInfo.scope.role === 'OWNER'),
    [workspaceInfo, isTeam]
  )

  return (
    <Stack spacing={4}>
      {isTeam ? (
        <>
          {isAtLeastAdmin && (
            <>
              <ChangeTeamNameCard workspaceInfo={workspaceInfo} />
              <ChangeTeamSlugCard workspaceInfo={workspaceInfo} />
            </>
          )}
        </>
      ) : (
        <>
          <ChangePersonalSlugCard workspaceInfo={workspaceInfo} />
        </>
      )}
    </Stack>
  )
}

export const GeneralSettingsPage = () => {
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
          <GeneralSettingsTab workspaceInfo={workspaceInfo} />
        </SideTabManager>
      </DashboardPageFrame>
    </>
  )
}

export default GeneralSettingsPage
