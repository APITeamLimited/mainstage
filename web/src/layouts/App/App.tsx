import { createContext, useRef, useState } from 'react'

import {
  useTheme,
  AppBar,
  Box,
  useMediaQuery,
  useScrollTrigger,
  Stack,
} from '@mui/material'

import { CommandPalette } from 'src/components/app/CommandPalette'
import { UserDropdown } from 'src/components/app/UserDropdown'
import { WorkspaceSwitcher } from 'src/components/app/WorkspaceSwitcher/WorkspaceSwitcher'
import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { ActiveWorkspace } from 'src/contexts/reactives'

export const AppBarHeightContext = createContext<number | undefined>(undefined)
const AppBarHeightProvider = AppBarHeightContext.Provider

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  })
  const appBarRef = useRef(null)

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
        position="sticky"
        sx={{
          top: 0,
          backgroundColor: theme.palette.background.default,
          marginBottom: 0,
          paddingX: 4,
          paddingY: 1,
        }}
        elevation={1}
        component="nav"
        ref={appBarRef}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <WorkspaceSwitcher />
          </Box>
          <Box>
            <CommandPalette />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <ThemeModeToggler />
              <UserDropdown />
            </Stack>
          </Box>
        </Stack>
      </AppBar>
      <AppBarHeightProvider
        value={appBarRef.current?.clientHeight || undefined}
      >
        <Box
          position="fixed"
          sx={{
            height: '100%',
            width: '100%',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <main>{children}</main>
        </Box>
      </AppBarHeightProvider>
    </Box>
  )
}
