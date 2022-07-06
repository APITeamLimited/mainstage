import { useState } from 'react'

import {
  useTheme,
  AppBar,
  Box,
  useMediaQuery,
  useScrollTrigger,
  Stack,
} from '@mui/material'

import { UserDropdown } from 'src/components/app/UserDropdown'
import { WorkspaceSwitcher } from 'src/components/app/WorkspaceSwitcher/WorkspaceSwitcher'
import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { ActiveWorkspace } from 'src/contexts/reactives'

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  })

  const [openSidebar, setOpenSidebar] = useState(false)

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true)
  }

  const handleSidebarClose = (): void => {
    setOpenSidebar(false)
  }

  const open = isMd ? false : openSidebar

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  })

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      <AppBar
        position={'fixed'}
        sx={{
          top: 0,
          backgroundColor: theme.palette.background.paper,
          marginBottom: 0,
          paddingY: 1,
          paddingX: 4,
        }}
        elevation={1}
        component="nav"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <WorkspaceSwitcher />
          </Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ThemeModeToggler />
            <UserDropdown />
          </Stack>
        </Stack>
      </AppBar>
      <main>{children}</main>
    </Box>
  )
}
