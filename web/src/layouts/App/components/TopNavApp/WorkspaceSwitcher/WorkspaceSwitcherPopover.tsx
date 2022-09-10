import { useEffect, useState } from 'react'

import { Workspace } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CheckIcon from '@mui/icons-material/Check'
import {
  Box,
  MenuItem,
  Popover,
  Typography,
  SvgIcon,
  useTheme,
  Stack,
  Avatar,
} from '@mui/material'

import { navigate, routes } from '@redwoodjs/router'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

import { CreateTeamDialog } from './CreateTeamDialog'

interface WorkspacePopoverProps {
  anchorEl: null | Element
  onClose: () => void
  open: boolean
}

type WorkspaceGroups = {
  personal: Workspace[]
  teams: Workspace[]
}

const getWorkspaceGroups = (workspaces: Workspace[]): WorkspaceGroups => {
  const personal = workspaces.find(
    (workspace) => workspace.scope?.variant === 'USER'
  )
  const teams = workspaces.filter(
    (workspace) => workspace.scope?.variant === 'TEAM'
  )

  if (!personal) {
    throw new Error('No personal workspace found')
  }

  return {
    personal: [personal],
    teams,
  }
}

export const WorkspaceSwitcherPopover = ({
  anchorEl,
  onClose,
  open,
}: WorkspacePopoverProps) => {
  const theme = useTheme()
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [workspaceGroups, setWorkspaceGroups] = useState<WorkspaceGroups>(
    getWorkspaceGroups(workspaces)
  )
  const [createTeamDialogOpen, setCreateTeamDialogOpen] =
    useState<boolean>(false)

  useEffect(
    () => setWorkspaceGroups(getWorkspaceGroups(workspaces)),
    [workspaces]
  )

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [activeWorkspace, activeWorkspaceId, workspaces])

  const switchWorkspace = (workspaceId: string) => {
    activeWorkspaceIdVar(workspaceId)
    navigate(routes.dashboard())
    onClose()
    console.log('switchWorkspace', workspaceId)
    activeWorkspaceIdVar(workspaceId)
  }

  return (
    <>
      <CreateTeamDialog
        isOpen={createTeamDialogOpen}
        onClose={(successful: boolean) => {
          setCreateTeamDialogOpen(false)
          successful && onClose()
        }}
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        onClose={onClose}
        open={open}
        sx={{
          mt: 1,
        }}
      >
        <Stack
          sx={{
            paddingX: 1,
            paddingY: 2,
          }}
          spacing={2}
        >
          {Object.entries(workspaceGroups).map(
            ([groupName, workspaces], indexGroup) => (
              <Box key={indexGroup}>
                <Typography
                  color={theme.palette.text.secondary}
                  sx={{
                    paddingLeft: 1,
                  }}
                  fontSize="0.8rem"
                  gutterBottom
                >
                  {groupName === 'personal' ? 'Personal Account' : 'Teams'}
                </Typography>
                {workspaces.map((workspace, indexWorkspace) => {
                  if (!workspace.scope) throw new Error('No scope found')
                  const { scope } = workspace
                  const isActive = workspace.id === activeWorkspaceId

                  return (
                    <MenuItem
                      key={`${indexGroup}-${indexWorkspace}`}
                      onClick={() => !isActive && switchWorkspace(workspace.id)}
                      sx={{
                        width: '250px',
                        padding: 1,
                        // ROund the corners of the menu item
                        borderRadius: 'md',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          overflow: 'hidden',
                          width: '100%',
                        }}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            width: '100%',
                            overflow: 'hidden',
                          }}
                        >
                          <Avatar
                            src={scope.profilePicture || ''}
                            sx={{
                              width: '25px',
                              height: '25px',
                            }}
                          />
                          <Typography
                            fontWeight={isActive ? 'bold' : 'normal'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {scope.displayName}
                          </Typography>
                        </Stack>
                        {isActive && (
                          <SvgIcon fontSize="small" component={CheckIcon} />
                        )}
                      </Stack>
                    </MenuItem>
                  )
                })}
                {groupName === 'teams' && (
                  <MenuItem
                    key={indexGroup}
                    sx={{
                      width: '250px',
                      padding: 1,
                      // ROund the corners of the menu item
                      borderRadius: 'md',
                    }}
                    onClick={() => setCreateTeamDialogOpen(true)}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        overflow: 'hidden',
                        width: '100%',
                      }}
                      alignItems="center"
                    >
                      <Box>
                        <Avatar
                          sx={{
                            width: '25px',
                            height: '25px',
                            maxWidth: '25px',
                            maxHeight: '25px',
                            backgroundColor: 'transparent',
                            overflow: 'visible',
                          }}
                        >
                          <SvgIcon
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: '29px',
                            }}
                            component={AddCircleOutlineIcon}
                          />
                        </Avatar>
                      </Box>
                      <Typography>Create Team</Typography>
                    </Stack>
                  </MenuItem>
                )}
              </Box>
            )
          )}
        </Stack>
      </Popover>
    </>
  )
}
