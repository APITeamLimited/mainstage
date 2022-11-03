import React from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { Container } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { APITeamLogo, LOGO_DEFAULT_HEIGHT } from 'src/components/APITeamLogo'
import { SignUpOrContinueButton } from 'src/pages/SplashPage/components/SignUpOrContinueButton'
import { brandedRoutes } from 'src/Routes'

import { NavItem } from './components/index'

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSidebarOpen: () => void
}

const Topbar = ({ onSidebarOpen }: Props): JSX.Element => {
  const theme = useTheme()

  return (
    <Container
      sx={{
        py: 2,
        backgroundColor: 'transparent',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width={1}
      >
        <Link
          to={routes.splash()}
          style={{
            textDecoration: 'none',
            color: theme.palette.text.primary,
            height: LOGO_DEFAULT_HEIGHT,
          }}
        >
          <APITeamLogo />
        </Link>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems="center">
          {brandedRoutes.map((route, index) => {
            if (route.includeAppBar === false) {
              return <></>
            }

            const marginLeft = index === 0 ? 0 : 4

            return (
              <Box key={index} marginLeft={marginLeft}>
                <NavItem
                  key={index}
                  id={route.name}
                  title={route.name}
                  items={route.sublinks}
                />
              </Box>
            )
          })}
          <Box marginLeft={4}>
            <SignUpOrContinueButton size="medium" />
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }} alignItems={'center'}>
          <Button
            onClick={() => onSidebarOpen()}
            aria-label="Menu"
            variant="outlined"
            sx={{
              borderRadius: 2,
              minWidth: 'auto',
              padding: 1,
              borderColor: alpha(theme.palette.divider, 0.2),
            }}
          >
            <MenuIcon />
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Topbar
