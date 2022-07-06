import type { FC } from 'react'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloudIcon from '@mui/icons-material/Cloud'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  Avatar,
  Box,
  Divider,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
  SvgIcon,
  Button,
  useTheme,
  Stack,
} from '@mui/material'
import toast from 'react-hot-toast'

import { Link } from '@redwoodjs/router'

import { ActiveWorkspace } from 'src/contexts/active-workspace-context'
import { useActiveWorkspace } from 'src/hooks/use-active-workspace'

import { CurrentUser } from './DropdownButton'
import { WorksaceMenuItem } from './WorkspaceSwitcherButton'

interface WorkspacePopoverProps {
  anchorEl: null | Element
  onClose?: () => void
  open?: boolean
  workspaces: WorksaceMenuItem[]
}

export const WorkspaceSwitcherPopover = (props: WorkspacePopoverProps) => {
  const { anchorEl, onClose, open, workspaces } = props
  const theme = useTheme()
  const { setWorkspace } = useActiveWorkspace()

  const handleLogout = async (): Promise<void> => {
    try {
      onClose?.()
      //await logout()
      //router.push('/').catch(console.error)
    } catch (err) {
      console.error(err)
      toast.error('Unable to logout.')
    }
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      keepMounted
      onClose={onClose}
      open={!!open}
      transitionDuration={0}
      sx={{
        mt: 1,
      }}
    >
      <Stack>
        {workspaces.map((workspace, index) => (
          <MenuItem
            key={index}
            onClick={() => setWorkspace(workspace as ActiveWorkspace)}
            sx={{
              padding: 2,
              alignItems: 'center',
              display: 'flex',
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
            {workspace.__typename === 'Anonymous' && (
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
