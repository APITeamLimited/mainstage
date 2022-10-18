import { useState } from 'react'

import { MemberAwareness } from '@apiteam/types/src'
import {
  Popover,
  Typography,
  Stack,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Box,
  useTheme,
  Divider,
  Button,
} from '@mui/material'

import { RoleChip } from 'src/components/team/RoleChip'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { CreateTeamDialog } from './CreateTeamDialog'
import { OnlineDot } from './OnlineDot'

interface TeamOverviewPopoverProps {
  anchorEl: null | Element
  onClose: () => void
  open: boolean
  members: MemberAwareness[]
}

export const TeamOverviewPopover = ({
  anchorEl,
  onClose,
  open,
  members,
}: TeamOverviewPopoverProps) => {
  const theme = useTheme()

  const workspaceInfo = useWorkspaceInfo()

  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false)

  return (
    <>
      <CreateTeamDialog
        isOpen={createTeamDialogOpen}
        onClose={(successful: boolean) => {
          setCreateTeamDialogOpen(false)
          successful && onClose()
        }}
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        onClose={onClose}
        open={open}
        sx={{
          mt: 1,
        }}
      >
        <Stack
          sx={{
            padding: 2,
            backgroundColor: theme.palette.background.paper,
            width: '250px',
          }}
          spacing={2}
        >
          <Stack>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                userSelect: 'none',
              }}
              gutterBottom
            >
              {workspaceInfo?.scope.displayName}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
              sx={{
                userSelect: 'none',
              }}
            >
              {workspaceInfo?.scope.variant === 'TEAM' ? 'Team' : 'Personal'}{' '}
              Workspace
            </Typography>
          </Stack>
          <Divider />
          {workspaceInfo?.scope.variant === 'TEAM' ? (
            <Box>
              <Typography
                color={theme.palette.text.secondary}
                fontSize="0.8rem"
                sx={{
                  paddingBottom: 2,
                  userSelect: 'none',
                }}
              >
                Members
              </Typography>
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                {members.map((member, index) => {
                  // If online in last minute, show online dot
                  // If online in last hour, show time in minutes else show time in hours
                  let display = null as string | null

                  if (member.lastOnline) {
                    const hoursSinceOnline =
                      (new Date().getTime() -
                        new Date(member.lastOnline).getTime()) /
                      1000 /
                      60 /
                      60
                    if (hoursSinceOnline < 1) {
                      display = Math.round(hoursSinceOnline * 60) + 'm'
                    } else {
                      display = Math.round(hoursSinceOnline) + 'h'
                    }
                  } else {
                    display = 'never'
                  }

                  if (
                    display === '0m' ||
                    display === '1m' ||
                    display === '2m'
                  ) {
                    display = 'now'
                  }

                  return (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box
                          sx={{
                            position: 'relative',
                            right: '-0.5rem',
                          }}
                        >
                          {display === 'now' ? (
                            <Tooltip title="Online now">
                              <span>
                                <OnlineDot />
                              </span>
                            </Tooltip>
                          ) : display !== 'never' ? (
                            <Tooltip title={`Last seen ${display} ago`}>
                              <span>
                                <Typography variant="body2">
                                  {display}
                                </Typography>
                              </span>
                            </Tooltip>
                          ) : null}
                        </Box>
                      }
                      sx={{
                        padding: 0,
                        width: '100%',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={member.profilePicture || ''}
                          sx={{
                            width: 32,
                            height: 32,
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <span
                            style={{
                              userSelect: 'none',
                              fontWeight:
                                workspaceInfo?.scope.userId === member.userId
                                  ? 600
                                  : 400,
                            }}
                          >
                            {member.displayName}
                            <RoleChip role={member.role} />
                          </span>
                        }
                        sx={{
                          marginLeft: -2,
                        }}
                      />
                    </ListItem>
                  )
                })}
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2}>
              <Typography
                color={theme.palette.text.secondary}
                fontSize="0.8rem"
                sx={{
                  userSelect: 'none',
                }}
              >
                Create a new team workspace to collaborate with others in
                real-time
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => setCreateTeamDialogOpen(true)}
              >
                Create Team
              </Button>
            </Stack>
          )}
        </Stack>
      </Popover>
    </>
  )
}
