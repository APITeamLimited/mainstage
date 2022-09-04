import { useMemo, useRef, useState } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { ListTeamMembers, ScopeRole } from 'types/graphql'

import { RoleChip } from 'src/components/team/RoleChip'

type MemberRowProps = {
  userRole: ScopeRole
  membership: ListTeamMembers['memberships'][0]
  setSnackSuccessMessage: (message: string | null) => void
  setSnackErrorMessage: (message: string | null) => void
  currentUserId: string
}

type AccessOptions = {
  showMakeMember: boolean
  showMakeAdmin: boolean
  showTransferOwnership: boolean
  denyReason?: string
}

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
        showMakeMember: false,
        showMakeAdmin: false,
        showTransferOwnership: false,
        denyReason:
          userRole === 'OWNER'
            ? 'Transfer your ownership to an admin to change your role'
            : 'You cannot change your own role',
      }
    }

    // If member is owner, show nothing
    if (membership.role === 'OWNER') {
      return {
        showMakeMember: false,
        showMakeAdmin: false,
        showTransferOwnership: false,
        denyReason: 'Only the owner can change the owner',
      }
    } else if (membership.role === 'ADMIN') {
      if (userRole === 'OWNER') {
        return {
          showMakeMember: true,
          showMakeAdmin: false,
          showTransferOwnership: true,
        }
      }
      return {
        showMakeMember: false,
        showMakeAdmin: false,
        showTransferOwnership: false,
        denyReason: 'Only owners can modify admins',
      }
    } else if (membership.role === 'MEMBER') {
      return {
        showMakeMember: false,
        showMakeAdmin: true,
        showTransferOwnership: false,
      }
    }

    throw new Error('Invalid role')
  }, [])

  return (
    <>
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
        <Stack
          sx={{
            paddingX: 1,
            paddingY: 2,
          }}
          spacing={2}
        >
          <MenuItem disabled={!showStates.showMakeMember}>
            <Typography>Make Member</Typography>
          </MenuItem>
          <MenuItem disabled={!showStates.showMakeAdmin}>
            <Typography>Make Admin</Typography>
          </MenuItem>
          <MenuItem disabled={!showStates.showTransferOwnership}>
            <Typography>Transfer Ownership</Typography>
          </MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
