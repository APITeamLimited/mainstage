import { useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import {
  Avatar,
  Box,
  Divider,
  MenuItem,
  Popover,
  Typography,
  SvgIcon,
  Stack,
  useTheme,
} from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'
import { CreateTeamDialog } from 'src/layouts/App/components/TopNavApp/WorkspaceSwitcher/CreateTeamDialog'

import { CurrentUser } from './DropdownButton'

interface AccountPopoverProps {
  anchorEl: null | Element
  onClose?: () => void
  open?: boolean
  currentUser: CurrentUser | null
}

export const DropdownPopover = (props: AccountPopoverProps) => {
  const { anchorEl, onClose, open, currentUser } = props
  const { logOut } = useAuth()
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const theme = useTheme()

  const fullName = currentUser
    ? `${props.currentUser?.firstName} ${props.currentUser?.lastName}`
    : 'Anonymous'

  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false)

  const handleLogout = () => {
    // Clear local storage of everything
    localStorage.clear()

    // Clear all cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })

    logOut()
    navigate(routes.splash())
    window.location.reload()
  }

  const handleNavigatePersonalSettings = () => {
    // Set active workspace to personal workspace
    const personalWorkspace = workspaces.find(
      (workspace) => workspace.scope?.variant === 'USER'
    )

    if (!personalWorkspace) {
      throw new Error('No personal workspace found')
    }

    if (personalWorkspace.id !== activeWorkspaceId) {
      activeWorkspaceIdVar(personalWorkspace.id)
    }

    navigate(routes.settingsWorkspace())
    onClose?.()
  }

  const handleNavigateDashboard = () => {
    navigate(routes.dashboard())
    onClose?.()
  }

  return (
    <>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        onClose={onClose}
        open={!!open}
        sx={{
          mt: 1,
        }}
      >
        <Stack
          sx={{
            padding: 1,
            backgroundColor: theme.palette.background.paper,
          }}
          spacing={1}
        >
          <Box
            sx={{
              alignItems: 'center',
              py: 1,
              paddingLeft: 1,
              display: 'flex',
            }}
          >
            <Avatar
              src={currentUser?.profilePicture || ''}
              sx={{
                height: 60,
                width: 60,
              }}
            >
              <SvgIcon
                component={AccountCircleIcon}
                sx={{
                  height: 60,
                  width: 60,
                }}
              />
            </Avatar>
            <Box
              sx={{
                mx: 2,
              }}
            >
              <Typography variant="h6">{fullName}</Typography>
              <Typography color="textSecondary" variant="body2">
                {currentUser?.email || null}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box>
            {currentUser ? (
              <>
                <MenuItem onClick={handleNavigateDashboard}>Dashboard</MenuItem>
                <Divider />
                <MenuItem onClick={() => setOpenCreateTeamDialog(true)}>
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
                    <Typography>New Team</Typography>
                    <AddIcon fontSize="small" />
                  </Stack>
                </MenuItem>
                <MenuItem onClick={handleNavigatePersonalSettings}>
                  Personal Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </>
            ) : (
              <MenuItem
                onClick={() =>
                  navigate(
                    routes.login({
                      redirectTo: routes.dashboard(),
                    })
                  )
                }
              >
                Login
              </MenuItem>
            )}
          </Box>
        </Stack>
      </Popover>
      <CreateTeamDialog
        isOpen={openCreateTeamDialog}
        onClose={(successful: boolean) => {
          if (successful) {
            navigate(routes.dashboard())
            setOpenCreateTeamDialog(false)
          } else {
            setOpenCreateTeamDialog(false)
          }
        }}
      />
    </>
  )
}
