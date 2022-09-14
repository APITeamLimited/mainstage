import { MemberAwareness } from '@apiteam/types'
import {
  Avatar,
  Chip,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

import { RoleChip } from 'src/components/team/RoleChip'

import { OnlineDot } from './OnlineDot'

type TeamMembersDropdownProps = {
  anchorEl: null | Element
  onClose: () => void
  open: boolean
  members: MemberAwareness[]
}

export const TeamMembersDropdown = ({
  anchorEl,
  onClose,
  open,
  members,
}: TeamMembersDropdownProps) => {
  return (
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
          width: '300px',
          backgroundColor: 'background.paper',
          paddingY: 1,
        }}
      >
        {members.map((member, index) => {
          /*const isOnline =
            member.lastOnline &&
            new Date(member.lastOnline).getTime() <
              new Date().getTime() - 1000 * 60

          const hoursSinceOnlineRaw = member.lastOnline
            ? ((new Date(member.lastOnline).getTime() - new Date().getTime()) /
                1000) *
              60 *
              60
            : null
          const lastSeen = hoursSinceOnlineRaw
            ? hoursSinceOnlineRaw < 1
              ? Math.round(hoursSinceOnlineRaw * 60) + 'm'
              : Math.round(hoursSinceOnlineRaw) + 'h'
            : null*/

          // If online in last minute, show online dot

          // If online in last hour, show time in minutes else show time in hours
          let display = null as string | null

          if (member.lastOnline) {
            const hoursSinceOnline =
              (new Date().getTime() - new Date(member.lastOnline).getTime()) /
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

          if (display === '0m' || display === '1m' || display === '2m') {
            display = 'now'
          }

          return (
            <ListItem
              key={index}
              secondaryAction={
                display === 'now' ? (
                  <Tooltip title="Online now">
                    <span>
                      <OnlineDot />
                    </span>
                  </Tooltip>
                ) : display !== 'never' ? (
                  <Tooltip title={`Last seen ${display} ago`}>
                    <span>
                      <Typography variant="body2">{display}</Typography>
                    </span>
                  </Tooltip>
                ) : null
              }
            >
              <ListItemAvatar>
                <Avatar src={member.profilePicture || ''} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <span
                    style={{
                      userSelect: 'none',
                    }}
                  >
                    {member.displayName}
                    <RoleChip role={member.role} />
                  </span>
                }
              />
            </ListItem>
          )
        })}
      </Stack>
    </Popover>
  )
}
