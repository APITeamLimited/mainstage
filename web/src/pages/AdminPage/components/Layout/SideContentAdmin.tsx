import { Button, Box, Stack, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { APITeamLogo } from 'src/components/APITeamLogo'

type SideContentProps = {
  onClose?: () => void
}

const sideGroups = [
  {
    title: 'Accounts',
    items: [
      {
        title: 'Users',
        gqlName: 'adminUsers',
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
            variant="h6"
            color={theme.palette.text.secondary}
            sx={{ paddingTop: 4, paddingLeft: 1 }}
          >
            {title}
          </Typography>
          {items.map(({ title, gqlName }, index) => (
            <Box key={index}>
              <Button
                sx={{
                  color: theme.palette.text.primary,
                }}
                variant="text"
                onClick={() => handleButtonClick(gqlName)}
              >
                {title}
              </Button>
            </Box>
          ))}
        </Stack>
      ))}
    </Stack>
  )
}
