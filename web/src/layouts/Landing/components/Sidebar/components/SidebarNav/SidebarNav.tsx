import React from 'react'

import { List, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { brandedRoutes } from 'src/Routes'

import NavItem from './components/NavItem'
import { APITeamLogo } from 'src/layouts/App/components/APITeamLogo'
import { SignUpOrContinueButton } from 'src/pages/splash/components/SignUpOrContinueButton'

const SidebarNav = (): JSX.Element => {
  const theme = useTheme()

  return (
    <Box>
      <Box width={1} padding={1}>
      <APITeamLogo />
      </Box>
      <Box
        sx={{
          paddingTop: 2,
        }}
      >
        {Object.keys(brandedRoutes).map((key, indexCategory) => {
          if (brandedRoutes[key].includeTopbar !== false) {
            return (
              <Stack
                spacing={2}
                key={indexCategory}
                sx={{
                  pt: 4,
                  paddingLeft: 1,
                }}
              >
                <Typography
                  variant="h6"
                  color={theme.palette.text.secondary}
                  sx={{ paddingLeft: 1 }}
                >
                  {brandedRoutes[key].name}
                </Typography>
                {brandedRoutes[key].subLinks.map(
                  (
                    subLink: {
                      name: string
                      path: string
                    },
                    indexSubLink
                  ) => (
                    <Box key={`${indexCategory}-${indexSubLink}`}>
                      <Link
                        to={subLink.path}
                        style={{ textDecoration: 'none' }}
                      >
                        <Button
                          variant="text"
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        >
                          {subLink.name}
                        </Button>
                      </Link>
                    </Box>
                  )
                )}
              </Stack>
            )
          }
        })}
      </Box>
      <Box paddingX={2} paddingY={3}>
      <SignUpOrContinueButton />
      </Box>
    </Box>
  )
}

export default SidebarNav
