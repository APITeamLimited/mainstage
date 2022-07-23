import { useState, useRef, useEffect } from 'react'

import { useReactiveVar } from '@apollo/client'
import CloudIcon from '@mui/icons-material/Cloud'
import GroupsIcon from '@mui/icons-material/Groups'
import HeightIcon from '@mui/icons-material/Height'
import {
  Box,
  SvgIcon,
  Typography,
  useTheme,
  Stack,
  Button,
} from '@mui/material'

import {
  activeWorkspaceIdVar,
  Workspace,
  workspacesVar,
} from 'src/contexts/reactives'

import { WorkspaceSwitcherPopover } from './WorkspaceSwitcherPopover'

export const MEMBERSHIPS_QUERY = gql`
  query WorkspaceSwitcherTeamMemberships {
    teamMemberships {
      team {
        id
        name
      }
      role
    }
  }
`

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
    return <></>
  }

  return (
    <>
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
          {activeWorkspace.__typename === 'User' && (
            <SvgIcon
              component={CloudIcon}
              sx={{
                paddingRight: 0.5,
                color: theme.palette.text.secondary,
              }}
            />
          )}
          {activeWorkspace.__typename === 'Team' && (
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
            activeWorkspace.__typename === 'Local' && <Box />
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
              {activeWorkspace.name}
            </Typography>
          </Stack>
        </Stack>
      </Button>
      <WorkspaceSwitcherPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  )
}
