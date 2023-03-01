import { Paper, Stack, Box, useTheme } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { routes } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { TopNavLink } from 'src/components/utils/TopNavLink'

import { UserDropdownButton } from './App/components/UserDropdown/UserDropdownButton'

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
        backgroundColor: disableTop
          ? 'transparent'
          : theme.palette.background.paper,
        height: '50px',
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        zIndex: theme.zIndex.appBar,
        position: 'relative',
      }}
      elevation={disableTop ? 0 : 1}
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
          <Stack direction="row" alignItems="center" spacing={2}>
            {leftZone}
          </Stack>
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            {rightZone}
            {!isAuthenticated && (
              <TopNavLink name="Login" path={routes.login()} />
            )}
            <ThemeModeToggler />
            <UserDropdownButton />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}
