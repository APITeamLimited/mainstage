import MenuIcon from '@mui/icons-material/Menu'
import { Container, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { APITeamLogo, LOGO_DEFAULT_HEIGHT } from 'src/components/APITeamLogo'
import { SignUpOrContinueButton } from 'src/pages/SplashPage/components/SignUpOrContinueButton'
import { brandedRoutes } from 'src/Routes'

import { NavItem } from './NavItem'

const landingTopBarXSpacing = 4

type LandingTopBarProps = {
  onSidebarOpen: () => void
  leftZone?: React.ReactNode
  rightZone?: React.ReactNode
  hideBrandedRoutes?: boolean
  hideSignUpOrContinueButton?: boolean
}

export const LandingTopBar = ({
  onSidebarOpen,
  leftZone,
  rightZone,
  hideBrandedRoutes,
  hideSignUpOrContinueButton,
}: LandingTopBarProps): JSX.Element => {
  const theme = useTheme()

  return (
    <Container
      sx={{
        py: 2,
        backgroundColor: 'transparent',
      }}
    >
      <Stack
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        direction="row"
        spacing={landingTopBarXSpacing}
      >
        <Stack
          direction="row"
          spacing={landingTopBarXSpacing}
          alignItems="center"
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
          {leftZone}
        </Stack>
        <Stack
          direction="row"
          spacing={landingTopBarXSpacing}
          alignItems="center"
        >
          {rightZone}
          {!hideBrandedRoutes && (
            <>
              {brandedRoutes
                .filter((route) => !route.hideInAppBar)
                .map((route, index) => {
                  const marginLeft = index === 0 ? 0 : landingTopBarXSpacing

                  return (
                    <Box
                      key={index}
                      marginLeft={marginLeft}
                      sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                      <NavItem
                        key={index}
                        id={route.name}
                        title={route.name}
                        items={route.sublinks}
                      />
                    </Box>
                  )
                })}
            </>
          )}
          {!hideSignUpOrContinueButton && (
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <SignUpOrContinueButton size="medium" />
            </Box>
          )}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }} alignItems="center">
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
        </Stack>
      </Stack>
    </Container>
  )
}
