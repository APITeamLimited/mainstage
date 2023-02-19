import { TeamRole } from '@apiteam/types'
import { Chip, useTheme } from '@mui/material'

type RoleChipProps = {
  role: TeamRole
}

export const RoleChip = ({ role }: RoleChipProps) => {
  const theme = useTheme()

  let roleBackgroundColor = undefined as undefined | string

  if (role === 'OWNER') {
    roleBackgroundColor =
      theme.palette.mode === 'light'
        ? theme.palette.grey[900]
        : theme.palette.grey[100]
  } else if (role === 'ADMIN') {
    roleBackgroundColor = theme.palette.primary.main
  } else if (role === 'MEMBER') {
    roleBackgroundColor = theme.palette.error.light
  } else {
    throw new Error(`Unknown role: ${role}`)
  }

  return (
    <Chip
      label={role}
      color="primary"
      size="small"
      sx={{
        fontSize: '10px',
        padding: 0,
        '& .MuiChip-label': {
          paddingX: '6px',
          fontWeight: 'bold',
          userSelect: 'none',
        },
        marginLeft: 1,
        transistion: 'background-color 0',
        height: '20px',
        backgroundColor: roleBackgroundColor,
      }}
    />
  )
}
