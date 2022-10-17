import { useMemo } from 'react'

import { Workspace } from '@apiteam/types/src'
import { Box, Divider, Stack } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { Headline } from 'src/pages/RootPage/components/Headline'

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
      return 'Personal Settings'
    } else {
      return 'Team Settings'
    }
  }, [workspaceInfo])

  if (!prettyType) return null
  if (!workspaceInfo) return null

  return (
    <>
      <MetaTags title={prettyType} />
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
          <GeneralSettingsTab workspaceInfo={workspaceInfo} />
        </SideTabManager>
      </Stack>
    </>
  )
}

export default GeneralSettingsPage
