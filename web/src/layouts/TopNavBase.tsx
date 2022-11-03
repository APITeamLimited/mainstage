import { Paper, Stack, Box, useTheme } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { routes } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { TopNavLink } from 'src/components/utils/TopNavLink'

import { UserDropdown } from './App/components/UserDropdown/UserDropdown'
import { nightAppBarColor } from './CustomAppBar'

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
        backgroundColor: disableTop
          ? 'transparent'
          : theme.palette.mode === 'light'
          ? theme.palette.background.paper
          : nightAppBarColor,
        height: '50px',
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        zIndex: 1,
        position: 'inherit',
      }}
      elevation={disableTop ? 0 : 8}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          width: '100%',
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
