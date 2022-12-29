import { Stack, Typography, Box, useTheme, Divider } from '@mui/material'

import { navigate } from '@redwoodjs/router'

import { APITeamLogo } from 'src/components/APITeamLogo'
import { brandedRoutes } from 'src/Routes'

import { SignUpOrContinueButton } from '../../../SignUpOrContinueButton'

type SidebarNavProps = {
  onClose: () => void
}

const SidebarNav = ({ onClose }: SidebarNavProps) => {
  const theme = useTheme()

  const handleLinkClick = (link: string) => {
    navigate(link)
    onClose()
  }

  return (
    <Stack
      spacing={2}
      alignItems="flex-start"
      sx={{
        padding: 2,
      }}
    >
      <APITeamLogo />
      <Divider flexItem />
      {Object.values(brandedRoutes).map((value, indexCategory) => {
        if (!value.hideInAppBar) {
          return (
            <Stack
              spacing={2}
              key={indexCategory}
              sx={{
                pl: 2,
              }}
            >
              <Typography variant="h6" color={theme.palette.text.secondary}>
                {value.name}
              </Typography>
              {value.sublinks.map(
                (
                  sublink: {
                    name: string
                    path: string
                  },
                  indexSublink
                ) => (
                  <Typography
                    key={indexSublink}
                    variant="h6"
                    color={theme.palette.text.primary}
                    onClick={() => handleLinkClick(sublink.path)}
                    sx={{
                      cursor: 'pointer',
                      py: 1,
                    }}
                  >
                    {sublink.name}
                  </Typography>
                )
              )}
            </Stack>
          )
        }
      })}
      <Divider flexItem />
      <Box
        sx={{
          width: '100%',
        }}
      >
        <SignUpOrContinueButton size="medium" fullWidth />
      </Box>
    </Stack>
  )
}

export default SidebarNav
