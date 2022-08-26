import React from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import {
  Container,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { APITeamLogo } from 'src/components/APITeamLogo'
import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { UserDropdown } from 'src/layouts/App/components/UserDropdown'

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSidebarOpen: () => void
}

const TopBarAdmin = ({ onSidebarOpen }: Props): JSX.Element => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  })

  return (
    <Container
      sx={{
        py: 2,
      }}
    >
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={1}
      >
        <Stack spacing={2} direction={'row'} alignItems={'center'}>
          {!isMd && (
            <Tooltip title="Toggle Sidebar">
              <Box sx={{ display: 'flex' }} alignItems={'center'}>
                <Button
                  onClick={() => onSidebarOpen()}
                  aria-label="Menu"
                  variant={'outlined'}
                  sx={{
                    borderRadius: 2,
                    minWidth: 'auto',
                    borderColor: alpha(theme.palette.divider, 0.2),
                  }}
                >
                  <MenuIcon />
                </Button>
              </Box>
            </Tooltip>
          )}
          <Box
            sx={{
              width: {
                xs: 100,
                sm: 120,
              },
            }}
          >
            <Link
              to={routes.splash()}
              style={{
                textDecoration: 'none',
                color: theme.palette.text.primary,
              }}
            >
              <APITeamLogo />
            </Link>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant={'h6'} color={'textPrimary'}>
            Admin
          </Typography>
          <ThemeModeToggler />
          <UserDropdown />
        </Stack>
      </Box>
    </Container>
  )
}

export default TopBarAdmin
