import { useState, useRef } from 'react'

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
import type { WorkspaceSwitcherTeamMemberships } from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'
import { useReactiveVar } from '@apollo/client'
import { activeWorkspaceVar, anonymousWorkspace } from 'src/contexts/reactives'

import { WorkspaceSwitcherPopover } from './WorkspaceSwitcherPopover'

// Make the type
const { teamMemberships } = new Object() as WorkspaceSwitcherTeamMemberships
export type TeamMemberships = typeof teamMemberships

type SwitcherProps = {
  memberships: TeamMemberships
}

export type WorksaceMenuItem = {
  name: string
  __typename: string
  id: string
}

export const WorkspaceSwitcherButton = ({ memberships }: SwitcherProps) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [openPopover, setOpenPopover] = useState<boolean>(false)
  const workspace = useReactiveVar(activeWorkspaceVar)
  const { currentUser } = useAuth()
  const theme = useTheme()

  const handleOpenPopover = (): void => {
    setOpenPopover(true)
  }

  const handleClosePopover = (): void => {
    setOpenPopover(false)
  }

  const workspaces = [
    {
      name: anonymousWorkspace.name,
      __typename: anonymousWorkspace.__typename,
      id: anonymousWorkspace.id,
    },
  ] as WorksaceMenuItem[]

  if (currentUser) {
    workspaces.push({
      name: 'Your Cloud Workspace',
      __typename: 'User',
      id: currentUser.id,
    })
  }

  workspaces.push(
    ...memberships.map((membership) => ({
      name: membership.team.name,
      __typename: membership.team.__typename,
      id: membership.team.id,
    }))
  )

  const currentWorkspace = workspaces.find(
    (listItem) => listItem.id === workspace.id
  )

  if (!currentWorkspace) {
    throw 'WorkspaceSwitcherButton: currentWorkspace not found'
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
          {currentWorkspace.__typename === 'User' && (
            <SvgIcon
              component={CloudIcon}
              sx={{
                paddingRight: 0.5,
                color: theme.palette.text.secondary,
              }}
            />
          )}
          {currentWorkspace.__typename === 'Team' && (
            <SvgIcon
              component={GroupsIcon}
              sx={{
                paddingRight: 0.5,
                color: theme.palette.text.secondary,
              }}
            />
          )}
          {currentWorkspace.__typename === 'Anonymous' && (
            <Box
              sx={{
                paddingRight: 0.5,
                width: 24,
              }}
            />
          )}
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
              {currentWorkspace.name}
            </Typography>
          </Stack>
        </Stack>
      </Button>
      <WorkspaceSwitcherPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
        workspaces={workspaces}
      />
    </>
  )
}
