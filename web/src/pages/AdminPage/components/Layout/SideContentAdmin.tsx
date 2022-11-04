import {
  ListItemText,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { APITeamLogo } from 'src/components/APITeamLogo'

import { UserAdmin } from '../users'

type SideContentProps = {
  onClose?: () => void
}

const sideGroups = [
  {
    title: 'Accounts',
    items: [
      {
        title: UserAdmin.displayNamePlural,
        gqlName: UserAdmin.gqlName,
      },
    ],
  },
  {
    title: 'Blog',
    items: [
      {
        title: 'Articles',
        gqlName: 'adminArticles',
      },
    ],
  },
]

export const SideContentAdmin = ({ onClose }: SideContentProps) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleButtonClick = (tabName: string) => {
    navigate(tabName)
    onClose?.()
  }

  return (
    <Stack
      spacing={2}
      sx={{
        margin: 2,
      }}
    >
      <APITeamLogo />
      {sideGroups.map(({ title, items }, index) => (
        <Stack key={index} spacing={2}>
          <Typography
            variant="overline"
            color={theme.palette.text.secondary}
            sx={{ paddingTop: 4, paddingLeft: 1 }}
          >
            {title}
          </Typography>
          {items.map(({ title, gqlName }, index) => (
            <MenuItem key={index} onClick={() => handleButtonClick(gqlName)}>
              <ListItemText primary={title} />
            </MenuItem>
          ))}
        </Stack>
      ))}
    </Stack>
  )
}
