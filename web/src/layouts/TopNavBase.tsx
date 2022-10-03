import { Paper, Stack, Box, useTheme } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { routes } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { TopNavLink } from 'src/components/utils/TopNavLink'

import { UserDropdown } from './App/components/UserDropdown/UserDropdown'

type TopNavBaseProps = {
  leftZone?: React.ReactNode
  rightZone?: React.ReactNode
  disableTop?: boolean
}

export const TopNavBase = ({
  leftZone,
  rightZone,
  disableTop = false,
}: TopNavBaseProps) => {
  const theme = useTheme()
  const { isAuthenticated } = useAuth()

  return (
    <Paper
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
        // For consistency with fix in landing TopNav
        marginY: '-0.5px',
        backgroundColor: theme.palette.background.paper,
        // Prevent app bar form changing color by applying desired linearGradien
        // all the time
        backgroundImage: disableTop
          ? undefined
          : 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
      }}
      elevation={disableTop ? 0 : 8}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          paddingY: 1,
          paddingX: 2,
        }}
      >
        <Box
          sx={{
            height: '100%',
          }}
        >
          {leftZone}
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            {rightZone}
            {!isAuthenticated && (
              <TopNavLink name="Login" path={routes.login()} />
            )}
            <ThemeModeToggler />
            <UserDropdown />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}
