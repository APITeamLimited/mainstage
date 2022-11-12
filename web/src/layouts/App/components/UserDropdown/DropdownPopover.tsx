import { useState, useMemo } from 'react'

import { SafeUser } from '@apiteam/types/src'
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
import { navigate, routes, useLocation } from '@redwoodjs/router'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'
import { CreateTeamDialog } from 'src/layouts/App/components/TopNavApp/WorkspaceOverview/CreateTeamDialog'
import { handleLogout, navigatePersonalSettings } from 'src/utils/nav-utils'

interface AccountPopoverProps {
  anchorEl: null | Element
  onClose?: () => void
  open?: boolean
  currentUser: SafeUser | null
}

export const DropdownPopover = ({
  anchorEl,
  onClose,
  open,
  currentUser,
}: AccountPopoverProps) => {
  const { logOut } = useAuth()
  const { pathname } = useLocation()
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const theme = useTheme()

  const inApp = useMemo(() => {
    return pathname.includes('/app')
  }, [pathname])

  const fullName = useMemo(
    () =>
      currentUser
        ? `${currentUser?.firstName} ${currentUser?.lastName}`
        : 'Anonymous',
    [currentUser]
  )

  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false)

  const handleNavigatePersonalSettings = () => {
    navigatePersonalSettings({
      workspaces,
      activeWorkspaceId,
    })
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
              <Typography variant="h6" fontWeight="bold">
                {fullName}
              </Typography>
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
                {inApp && (
                  <>
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
                      Personal Account Settings
                    </MenuItem>
                    <Divider />
                  </>
                )}
                <MenuItem onClick={() => handleLogout(logOut)}>Logout</MenuItem>
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
