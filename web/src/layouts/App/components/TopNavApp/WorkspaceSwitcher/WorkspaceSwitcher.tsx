import { useState, useRef, useEffect } from 'react'

import { Workspace } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import {
  Typography,
  useTheme,
  Stack,
  Skeleton,
  Tooltip,
  Avatar,
  Chip,
  IconButton,
  Box,
  ButtonBase,
} from '@mui/material'

import { navigate, routes } from '@redwoodjs/router'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

import { WorkspaceSwitcherPopover } from './WorkspaceSwitcherPopover'

export const WorkspaceSwitcher = () => {
  const anchorRef = useRef<Element | null>(null)
  const [openPopover, setOpenPopover] = useState<boolean>(false)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)
  const theme = useTheme()
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)

  useEffect(
    () =>
      setActiveWorkspace(
        workspaces.find((workspace) => workspace.id === activeWorkspaceId) ||
          null
      ),
    [activeWorkspace, activeWorkspaceId, workspaces]
  )

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

  return (
    <Box>
      <ButtonBase onClick={() => navigate(routes.dashboard())} disableRipple>
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            width: '100%',
            overflow: 'hidden',
          }}
          ref={anchorRef}
        >
          <Avatar
            src={activeWorkspace?.scope?.profilePicture || ''}
            sx={{
              width: '25px',
              height: '25px',
            }}
          />

          <Typography
            fontWeight="bold"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitUserSelect: 'none',
              marginLeft: 1,
            }}
          >
            {activeWorkspace.scope
              ? activeWorkspace.scope.displayName
              : 'Local'}
          </Typography>
          <Box>
            <Chip
              label={
                !activeWorkspace.scope
                  ? 'Local'
                  : activeWorkspace.scope.variant === 'USER'
                  ? 'PERSONAL'
                  : 'TEAM'
              }
              color="primary"
              size="small"
              sx={{
                fontSize: '10px',
                padding: 0,
                '& .MuiChip-label': {
                  paddingX: '6px',
                  fontWeight: 'bold',
                },
                marginLeft: 1,
                transistion: 'background-color 0',
                height: '20px',
                backgroundColor: !activeWorkspace.scope
                  ? theme.palette.grey[500]
                  : activeWorkspace.scope.variant === 'USER'
                  ? theme.palette.primary.main
                  : theme.palette.mode === 'light'
                  ? theme.palette.grey[900]
                  : theme.palette.grey[100],
              }}
            />
          </Box>
        </Stack>
      </ButtonBase>
      <Tooltip title="Switch Workspace">
        <IconButton onClick={handleOpenPopover}>
          <UnfoldMoreIcon />
        </IconButton>
      </Tooltip>
      <WorkspaceSwitcherPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </Box>
  )
}
