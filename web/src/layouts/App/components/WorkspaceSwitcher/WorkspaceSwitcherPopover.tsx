import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import CloudIcon from '@mui/icons-material/Cloud'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  Box,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
  SvgIcon,
  useTheme,
  Stack,
} from '@mui/material'

import { navigate, routes } from '@redwoodjs/router'

import {
  Workspace,
  activeWorkspaceIdVar,
  workspacesVar,
} from 'src/contexts/reactives'

interface WorkspacePopoverProps {
  anchorEl: null | Element
  onClose: () => void
  open: boolean
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

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [activeWorkspace, activeWorkspaceId, workspaces])

  const switchWorkspace = (workspaceId: string) => {
    activeWorkspaceIdVar(workspaceId)
    navigate(routes.dashboard())
    onClose()
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      onClose={onClose}
      open={!!open}
      sx={{
        mt: 1,
      }}
    >
      <Stack>
        {workspaces.map((workspace, index) => (
          <MenuItem
            key={index}
            onClick={() => switchWorkspace(workspace.id)}
            sx={{
              padding: 2,
              alignItems: 'center',
              display: 'flex',
              backgroundColor:
                activeWorkspace && activeWorkspace.id === workspace.id
                  ? theme.palette.background.default
                  : theme.palette.background.paper,
            }}
          >
            {workspace.__typename === 'User' && (
              <>
                <SvgIcon
                  component={CloudIcon}
                  sx={{
                    paddingRight: 2,
                    color: theme.palette.text.secondary,
                    width: 24,
                  }}
                />
                <ListItemText
                  primary={
                    <Typography variant="body1">{workspace.name}</Typography>
                  }
                  secondary={
                    <Typography
                      fontSize="small"
                      color={theme.palette.text.secondary}
                    >
                      Your private workspace backed up on APITeam servers
                    </Typography>
                  }
                />
              </>
            )}
            {workspace.__typename === 'Team' && (
              <>
                <SvgIcon
                  component={GroupsIcon}
                  sx={{
                    paddingRight: 2,
                    color: theme.palette.text.secondary,
                    width: 24,
                  }}
                />
                <ListItemText
                  primary={
                    <Typography variant="body1">{workspace.name}</Typography>
                  }
                  secondary={
                    <Typography
                      fontSize="small"
                      color={theme.palette.text.secondary}
                    >
                      Collaborative workspace backed up on APITeam servers
                    </Typography>
                  }
                />
              </>
            )}
            {workspace.__typename === 'Local' && (
              <>
                <Box
                  sx={{
                    paddingRight: 2,
                    width: 24,
                  }}
                />
                <ListItemText
                  primary={
                    <Typography variant="body1">{workspace.name}</Typography>
                  }
                  secondary={
                    <Typography
                      fontSize="small"
                      color={theme.palette.text.secondary}
                    >
                      Local to this browser only
                    </Typography>
                  }
                />
              </>
            )}
          </MenuItem>
        ))}
      </Stack>
    </Popover>
  )
}
