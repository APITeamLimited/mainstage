import { useMemo, useRef, useState } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Popover,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Typography,
  DialogContentText,
} from '@mui/material'
import {
  ChangeUserRole,
  ChangeUserRoleVariables,
  ListTeamMembers,
  RemoveUserFromTeam,
  RemoveUserFromTeamVariables,
  ScopeRole,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import { RoleChip } from 'src/components/team/RoleChip'

type MemberRowProps = {
  userRole: ScopeRole
  membership: ListTeamMembers['memberships'][0]
  setSnackSuccessMessage: (message: string | null) => void
  setSnackErrorMessage: (message: string | null) => void
  currentUserId: string
}

type AccessOptions = {
  showRemoveFromTeam: boolean
  showMakeMember: boolean
  showMakeAdmin: boolean
  denyReason?: string
}

const CHANGE_USER_ROLE_MUTATION = gql`
  mutation ChangeUserRole(
    $userId: String!
    $teamId: String!
    $role: ChangeRoleInput!
  ) {
    changeUserRole(userId: $userId, teamId: $teamId, role: $role) {
      id
      role
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`

const REMOVE_USER_FROM_TEAM_MUTATION = gql`
  mutation RemoveUserFromTeam($userId: String!, $teamId: String!) {
    removeUserFromTeam(userId: $userId, teamId: $teamId) {
      id
      role
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`

export const MemberRow = ({
  userRole,
  membership,
  setSnackSuccessMessage,
  setSnackErrorMessage,
  currentUserId,
}: MemberRowProps) => {
  const [showPopover, setShowPopover] = useState(false)
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  const showStates = useMemo<AccessOptions>(() => {
    if (membership.user.id === currentUserId) {
      return {
        showRemoveFromTeam: false,
        showMakeMember: false,
        showMakeAdmin: false,
        denyReason:
          userRole === 'OWNER'
            ? 'Transfer your ownership to an admin to change your role'
            : 'You cannot change your own role',
      }
    }

    // If member is owner, show nothing
    if (membership.role === 'OWNER') {
      return {
        showRemoveFromTeam: false,
        showMakeMember: false,
        showMakeAdmin: false,
        denyReason: "Only the owner can change the owner's role",
      }
    } else if (membership.role === 'ADMIN') {
      if (userRole === 'OWNER') {
        return {
          showRemoveFromTeam: true,
          showMakeMember: true,
          showMakeAdmin: false,
        }
      }
      return {
        showRemoveFromTeam: false,
        showMakeMember: false,
        showMakeAdmin: false,
        denyReason: 'Only owners can modify admins',
      }
    } else if (membership.role === 'MEMBER') {
      return {
        showRemoveFromTeam: true,
        showMakeMember: false,
        showMakeAdmin: true,
      }
    }

    throw new Error('Invalid role')
  }, [currentUserId, membership.role, membership.user.id, userRole])

  const [actionFunction, setActionFunction] = useState<null | {
    actionFunction: () => void
    title: string
    description: string
    buttonText: string
    open: boolean
  }>(null)

  const [removeUserFromTeam] = useMutation<
    RemoveUserFromTeam,
    RemoveUserFromTeamVariables
  >(REMOVE_USER_FROM_TEAM_MUTATION, {
    variables: {
      userId: membership.user.id,
      teamId: membership.teamId,
    },
    onCompleted: () => {
      setSnackSuccessMessage(
        `Removed ${membership.user.firstName} from the team`
      )
      setShowPopover(false)
    },
    onError: (error) => {
      setSnackErrorMessage(`Error removing user: ${error.message}`)
    },
  })

  const [changeUserRole] = useMutation<ChangeUserRole, ChangeUserRoleVariables>(
    CHANGE_USER_ROLE_MUTATION,
    {
      onCompleted: () => {
        setSnackSuccessMessage(
          `${membership.user.firstName} is now ${
            membership.role === 'ADMIN' ? 'an admin' : 'a member'
          }`
        )
        setShowPopover(false)
      },
      onError: (error) => {
        setSnackErrorMessage(`Error changing user's role: ${error.message}`)
      },
    }
  )

  return (
    <>
      <Dialog
        open={actionFunction !== null && actionFunction.open}
        onClose={() =>
          setActionFunction(
            actionFunction ? { ...actionFunction, open: false } : null
          )
        }
        aria-labelledby={actionFunction?.title}
        aria-describedby={actionFunction?.description}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{actionFunction?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{actionFunction?.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setActionFunction(
                actionFunction ? { ...actionFunction, open: false } : null
              )
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              actionFunction?.actionFunction()
              setActionFunction(
                actionFunction ? { ...actionFunction, open: false } : null
              )
            }}
            color="error"
          >
            {actionFunction?.buttonText}
          </Button>
        </DialogActions>
      </Dialog>
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={1} alignItems="center">
            <RoleChip role={membership.role} />
            <Tooltip title={showStates.denyReason || 'Manage Member'}>
              <span>
                <IconButton
                  ref={anchorRef}
                  onClick={() => setShowPopover(true)}
                  disabled={!!showStates.denyReason}
                >
                  <MoreVertIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        }
      >
        <ListItemAvatar>
          <Avatar src={membership.user.profilePicture || ''} />
        </ListItemAvatar>
        <ListItemText
          primary={`${membership.user.firstName} ${membership.user.lastName}`}
          secondary={membership.user.email}
        />
      </ListItem>
      <Popover
        open={showPopover}
        anchorEl={anchorRef.current}
        onClose={() => setShowPopover(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          marginTop: 1,
        }}
      >
        <Stack>
          <MenuItem
            disabled={!showStates.showRemoveFromTeam}
            onClick={() =>
              setActionFunction({
                actionFunction: removeUserFromTeam,
                title: 'Remove from team',
                description:
                  'Are you sure you want to remove this member from the team?',
                buttonText: 'Remove',
                open: true,
              })
            }
          >
            <Typography>Remove User</Typography>
          </MenuItem>
          <MenuItem
            disabled={!showStates.showMakeMember}
            onClick={() =>
              setActionFunction({
                actionFunction: () =>
                  changeUserRole({
                    variables: {
                      userId: membership.user.id,
                      teamId: membership.teamId,
                      role: 'MEMBER',
                    },
                  }),
                title: 'Make Member',
                description:
                  'Are you sure you want to make this member a member?',
                buttonText: 'Make Member',
                open: true,
              })
            }
          >
            <Typography>Make Member</Typography>
          </MenuItem>
          <MenuItem
            disabled={!showStates.showMakeAdmin}
            onClick={() =>
              setActionFunction({
                actionFunction: () =>
                  changeUserRole({
                    variables: {
                      userId: membership.user.id,
                      teamId: membership.teamId,
                      role: 'ADMIN',
                    },
                  }),
                title: 'Make Admin',
                description:
                  'Are you sure you want to make this member an admin?',
                buttonText: 'Make Admin',
                open: true,
              })
            }
          >
            <Typography>Make Admin</Typography>
          </MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
