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

import { ActiveWorkspace, activeWorkspaceVar } from 'src/contexts/reactives'

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
            onClick={() => activeWorkspaceVar(workspace as ActiveWorkspace)}
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
