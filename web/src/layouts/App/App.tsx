import { createContext, useRef, useState } from 'react'

import {
  useTheme,
  AppBar,
  Box,
  useMediaQuery,
  useScrollTrigger,
  Stack,
} from '@mui/material'

import { ModalsProvider } from 'src/components/app/dialogs'
import ThemeModeToggler from 'src/components/ThemeModeToggler'
import { ReactiveVarPersistor } from 'src/contexts/reactives/ReactiveVarPersistor'
import { EntityEngine } from 'src/entity-engine'

import { APITeamLogo } from './components/APITeamLogo'
import { CommandPalette } from './components/CommandPalette'
import { UserDropdown } from './components/UserDropdown'
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher/WorkspaceSwitcher'

export const AppBarHeightContext = createContext<number | undefined>(undefined)
const AppBarHeightProvider = AppBarHeightContext.Provider

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  })
  const appBarRef = useRef<HTMLDivElement>(null)

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
    <>
      <ReactiveVarPersistor />
      <EntityEngine>
        <ModalsProvider>
          <AppBar
            position="sticky"
            sx={{
              top: 0,
              backgroundColor: theme.palette.background.paper,
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
              <Stack direction="row" alignItems="center" spacing={2}>
                <APITeamLogo />
                <WorkspaceSwitcher />
              </Stack>
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
                height: `calc(100vh - ${appBarRef.current?.clientHeight}px)`,
                width: '100%',
                //height: '100%',
                backgroundColor: theme.palette.background.default,
              }}
            >
              <main
                style={{
                  height: '100%',
                  width: '100%',
                }}
              >
                {children}
              </main>
            </Box>
          </AppBarHeightProvider>
        </ModalsProvider>
      </EntityEngine>
    </>
  )
}
