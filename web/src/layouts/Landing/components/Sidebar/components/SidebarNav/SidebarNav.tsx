import React from 'react'

import { List, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { APITeamLogo } from 'src/components/APITeamLogo'
import { SignUpOrContinueButton } from 'src/pages/RootPage/components/SignUpOrContinueButton'
import { brandedRoutes } from 'src/Routes'

const SidebarNav = (): JSX.Element => {
  const theme = useTheme()

  return (
    <Box>
      <Box width={1} margin={1}>
        <APITeamLogo />
      </Box>
      <Box
        sx={{
          paddingTop: 2,
        }}
      >
        {Object.values(brandedRoutes).map((value, indexCategory) => {
          if (value.includeAppBar !== false) {
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
                    <Box key={`${indexCategory}-${indexSublink}`}>
                      <Link
                        to={sublink.path}
                        style={{ textDecoration: 'none' }}
                      >
                        <Button
                          variant="text"
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        >
                          {sublink.name}
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
