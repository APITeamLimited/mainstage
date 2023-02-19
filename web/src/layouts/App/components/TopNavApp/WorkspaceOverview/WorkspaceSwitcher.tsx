import { useState, useRef, useMemo } from 'react'

import { MemberAwareness } from '@apiteam/types'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import {
  Typography,
  useTheme,
  Stack,
  Tooltip,
  Avatar,
  Chip,
  IconButton,
  Box,
  MenuItem,
  AvatarGroup,
  Badge,
} from '@mui/material'

import {
  useServerAwareness,
  useWorkspaceInfo,
} from 'src/entity-engine/EntityEngine'
import { nightAppBarColor } from 'src/layouts/CustomAppBar'

import { WorkspaceOverviewPopover } from './WorkspaceOverviewPopover'
import { WorkspaceSwitcherPopover } from './WorkspaceSwitcherPopover'

export const WorkspaceSwitcher = () => {
  const theme = useTheme()

  const workspaceInfo = useWorkspaceInfo()

  const teamOverviewAnchorRef = useRef<HTMLLIElement | null>(null)
  const [teamOverviewOpen, setTeamOverviewOpen] = useState(false)

  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] =
    useState<boolean>(false)
  const workspaceSwitcherAnchorRef = useRef<HTMLLIElement | null>(null)

  const serverAwareness = useServerAwareness()

  const usedMembers = useMemo(() => {
    if (
      workspaceInfo?.scope?.variant !== 'TEAM' ||
      serverAwareness?.variant !== 'TEAM'
    ) {
      return [
        {
          userId: workspaceInfo?.scope?.userId,
          displayName: workspaceInfo?.scope?.displayName,
          role: 'OWNER',
          profilePicture: workspaceInfo?.scope?.profilePicture,
          joinedTeam: new Date(),
          lastOnline: new Date(),
        },
      ] as MemberAwareness[]
    }

    return serverAwareness.members
  }, [workspaceInfo, serverAwareness])

  if (!workspaceInfo) return <></>

  return (
    <>
      <Stack direction="row" alignItems="center">
        <MenuItem
          onClick={() => setTeamOverviewOpen(true)}
          sx={{
            borderRadius: 1,
            padding: 1,
            userSelect: 'pointer',
          }}
          ref={teamOverviewAnchorRef}
        >
          <Stack
            direction="row"
            alignItems="center"
            ref={workspaceSwitcherAnchorRef}
          >
            <AvatarGroup
              max={3}
              sx={{
                marginLeft: workspaceInfo.scope.variant === 'TEAM' ? 1 : 0,
                '& .MuiAvatar-root': {
                  borderColor:
                    theme.palette.mode === 'light'
                      ? theme.palette.background.paper
                      : nightAppBarColor,
                },
              }}
            >
              {usedMembers.map((member, index) => {
                const isOnline =
                  member.lastOnline &&
                  new Date(member.lastOnline).getTime() >
                    new Date().getTime() - 1000 * 60

                return isOnline && workspaceInfo.scope.variant === 'TEAM' ? (
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#44b700',
                        color: '#44b700',
                        height: '12px',
                        width: '12px',
                        borderRadius: '50%',
                        right: '6px',
                        bottom: '6px',
                        border: `2px solid ${
                          theme.palette.mode === 'light'
                            ? theme.palette.background.paper
                            : nightAppBarColor
                        }`,
                      },
                    }}
                    key={index}
                  >
                    <Avatar
                      alt={member.displayName}
                      src={member.profilePicture || ''}
                      sx={{
                        width: 24,
                        height: 24,
                      }}
                    />
                  </Badge>
                ) : (
                  <Avatar
                    alt={member.displayName}
                    src={member.profilePicture || ''}
                    sx={{
                      width: 24,
                      height: 24,
                    }}
                    key={index}
                  />
                )
              })}
            </AvatarGroup>
            <Typography
              fontWeight="bold"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                WebkitUserSelect: 'none',
                marginLeft: 1,
              }}
            >
              {workspaceInfo.scope.displayName}
            </Typography>
            <Box>
              <Chip
                label={
                  workspaceInfo.scope.variant === 'USER' ? 'PERSONAL' : 'TEAM'
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
                  backgroundColor: !workspaceInfo.scope
                    ? theme.palette.grey[500]
                    : workspaceInfo.scope.variant === 'USER'
                    ? theme.palette.primary.main
                    : theme.palette.mode === 'light'
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  cursor: 'pointer',
                }}
              />
            </Box>
          </Stack>
        </MenuItem>
        <Tooltip title="Switch Workspace">
          <IconButton onClick={() => setWorkspaceSwitcherOpen(true)}>
            <UnfoldMoreIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <WorkspaceSwitcherPopover
        anchorEl={workspaceSwitcherAnchorRef.current}
        onClose={() => setWorkspaceSwitcherOpen(false)}
        open={workspaceSwitcherOpen}
      />
      <WorkspaceOverviewPopover
        anchorEl={teamOverviewAnchorRef.current}
        onClose={() => setTeamOverviewOpen(false)}
        open={teamOverviewOpen}
        members={usedMembers}
      />
    </>
  )
}
