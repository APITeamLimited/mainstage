import { useMemo } from 'react'

import { Box, Stack, Typography, useTheme } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { SETTINGS_TABS } from '..'

import { InvoicesCard } from './InvoicesCard'

const InvoicesSettingsPage = () => {
  const theme = useTheme()
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
        <SideTabManager
          basePath={routes.settingsWorkspace()}
          possibleTabs={SETTINGS_TABS}
        >
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Invoices
              </Typography>
              <Typography variant="body1" color={theme.palette.text.secondary}>
                View your {workspaceInfo.isTeam ? 'team' : 'personal'} invoices
                and payment history.
              </Typography>
            </Box>
            <InvoicesCard />
          </Stack>
        </SideTabManager>
      </DashboardPageFrame>
    </>
  )
}

export default InvoicesSettingsPage
