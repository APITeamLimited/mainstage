import { TeamRole } from '@apiteam/types/src'
import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material'

import { RoleChip } from 'src/components/team/RoleChip'

type QuickUserSummaryProps = {
  profilePicture?: string
  displayName?: string
  role?: TeamRole
  secondaryAction?: React.ReactNode
  isEmphasized?: boolean
  minimal?: boolean
}

export const QuickUserSummary = ({
  profilePicture,
  displayName = 'Unknown User',
  role = 'MEMBER',
  secondaryAction,
  isEmphasized,
  minimal,
}: QuickUserSummaryProps) => {
  return (
    <ListItem
      secondaryAction={secondaryAction}
      sx={{
        padding: 0,
        width: '100%',
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={profilePicture}
          sx={{
            width: 24,
            height: 24,
          }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <span
            style={{
              userSelect: 'none',
              fontWeight: isEmphasized ? 600 : 400,
            }}
          >
            {displayName}
            {!minimal && <RoleChip role={role} />}
          </span>
        }
        sx={{
          marginLeft: minimal ? -4 : -2,
        }}
      />
    </ListItem>
  )
}
