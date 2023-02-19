import { useMemo } from 'react'

import { Workspace } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Button, Card, Stack, Typography, useTheme } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { navigatePersonalSettings } from 'src/utils/nav-utils'

import { SETTINGS_TABS } from '..'

import { ChangePersonalNameCard } from './ChangePersonalNameCard'
import { ChangePersonalSlugCard } from './ChangePersonalSlugCard'
import { ChangeTeamNameCard } from './ChangeTeamNameCard'
import { ChangeTeamSlugCard } from './ChangeTeamSlugCard'

type GeneralSettingsTabProps = {
  workspaceInfo: Workspace
}

const GeneralSettingsTab = ({ workspaceInfo }: GeneralSettingsTabProps) => {
  const theme = useTheme()
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)

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
          {isAtLeastAdmin ? (
            <>
              <ChangeTeamNameCard workspaceInfo={workspaceInfo} />
              <ChangeTeamSlugCard workspaceInfo={workspaceInfo} />
              <Card>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack spacing={2} p={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Personal Settings
                    </Typography>
                    <Typography variant="body2">
                      Looking for your personal account settings?
                    </Typography>
                    <div>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          navigatePersonalSettings({
                            workspaces,
                            activeWorkspaceId,
                          })
                        }}
                        endIcon={<ChevronRightIcon />}
                      >
                        Go to your personal account settings
                      </Button>
                    </div>
                  </Stack>
                  <AccountCircleIcon
                    sx={{
                      marginRight: 2,
                      width: 40,
                      height: 40,
                      color: theme.palette.action.disabled,
                    }}
                  />
                </Stack>
              </Card>
            </>
          ) : (
            <>
              <EmptyPanelMessage
                primaryText="You are not an admin of this team"
                secondaryMessages={[
                  "Ask to be promoted to an admin to change your team's settings",
                ]}
                icon={
                  <AccountCircleIcon
                    sx={{
                      marginBottom: 2,
                      width: 80,
                      height: 80,
                      color: theme.palette.action.disabled,
                    }}
                  />
                }
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    navigatePersonalSettings({
                      workspaces,
                      activeWorkspaceId,
                    })
                  }}
                  sx={{
                    marginTop: 2,
                  }}
                >
                  Go to your personal account settings
                </Button>
              </EmptyPanelMessage>
            </>
          )}
        </>
      ) : (
        <>
          <ChangePersonalNameCard />
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
