import { useState, useRef, useEffect } from 'react'

import { useReactiveVar } from '@apollo/client'
import CloudIcon from '@mui/icons-material/Cloud'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  Box,
  SvgIcon,
  Typography,
  useTheme,
  Stack,
  Button,
  Skeleton,
  Tooltip,
} from '@mui/material'
import { Workspace } from 'types/src'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

import { WorkspaceSwitcherPopover } from './WorkspaceSwitcherPopover'

export const WorkspaceSwitcher = () => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [openPopover, setOpenPopover] = useState<boolean>(false)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)
  const theme = useTheme()
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [activeWorkspace, activeWorkspaceId, workspaces])

  const handleOpenPopover = (): void => {
    setOpenPopover(true)
  }

  const handleClosePopover = (): void => {
    setOpenPopover(false)
  }

  if (!activeWorkspace) {
    return (
      <Skeleton
        variant="rectangular"
        width={172.58}
        height={44.3}
        sx={{
          marginLeft: 8,
          borderRadius: 1,
        }}
      />
    )
  }

  //console.log('workspaces', workspaces)

  return (
    <>
      <Tooltip title="Switch Workspace">
        <Button
          onClick={handleOpenPopover}
          color="secondary"
          variant="outlined"
          ref={anchorRef}
          sx={{
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Stack spacing={1} direction="row" alignItems="center">
            {activeWorkspace.remote && !activeWorkspace.isTeam && (
              <SvgIcon
                component={CloudIcon}
                sx={{
                  paddingRight: 0.5,
                  color: theme.palette.text.secondary,
                }}
              />
            )}
            {activeWorkspace.isTeam && (
              <SvgIcon
                component={GroupsIcon}
                sx={{
                  paddingRight: 0.5,
                  color: theme.palette.text.secondary,
                }}
              />
            )}
            {
              // Needed to keep the space
              !activeWorkspace.remote && <Box />
            }
            <Stack alignItems="flex-start">
              <Typography
                variant="body2"
                fontSize={10}
                color={theme.palette.text.secondary}
                textTransform="none"
              >
                Workspace
              </Typography>
              <Typography
                variant="body1"
                color={theme.palette.text.primary}
                fontSize={12}
              >
                {activeWorkspace.scope?.displayName}
              </Typography>
            </Stack>
          </Stack>
        </Button>
      </Tooltip>
      <WorkspaceSwitcherPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  )
}
