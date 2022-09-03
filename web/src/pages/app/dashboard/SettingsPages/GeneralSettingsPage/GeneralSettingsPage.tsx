import { useCallback, useEffect, useMemo } from 'react'

import { Box, Divider, Stack } from '@mui/material'

import { routes } from '@redwoodjs/router'

import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { Headline } from 'src/pages/splash/components/Headline'

import { SETTINGS_TABS } from '..'

const GeneralSettingsTab = () => {
  return <></>
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

  return (
    <Stack spacing={6}>
      <Box>
        <Headline headline={prettyType} />
        <Divider
          sx={{
            marginTop: 6,
          }}
        />
      </Box>
      <SideTabManager basePath={basePath} possibleTabs={SETTINGS_TABS}>
        <GeneralSettingsTab />
      </SideTabManager>
    </Stack>
  )
}

export default GeneralSettingsPage
