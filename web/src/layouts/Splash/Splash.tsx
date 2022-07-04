import React, { useState } from 'react'

import {
  Stack,
  useTheme,
  AppBar,
  Box,
  Divider,
  useMediaQuery,
  useScrollTrigger,
} from '@mui/material'

import FooterSplash from 'src/layouts/Splash/FooterSplash'
import TopNav from 'src/layouts/Splash/TopNav'

import { Topbar, Sidebar } from './components'

type SplashLayoutProps = {
  children?: React.ReactNode
}

const SplashLayout = ({ children }: SplashLayoutProps) => {
  const colorInvert = false
  const bgcolor = 'transparent'

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
    <Box>
      <Box
        bgcolor={bgcolor}
        position={'relative'}
        zIndex={theme.zIndex.appBar}
        sx={{
          padding: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <TopNav colorInvert={colorInvert} />
      </Box>
      <AppBar
        position={'sticky'}
        sx={{
          top: 0,
          backgroundColor: trigger
            ? theme.palette.background.paper
            : theme.palette.background.paper,
        }}
        elevation={trigger ? 1 : 0}
      >
        <Stack
          sx={{
            padding: 2,
          }}
        >
          <Topbar
            onSidebarOpen={handleSidebarOpen}
            colorInvert={trigger ? false : colorInvert}
          />
        </Stack>
      </AppBar>
      <Sidebar onClose={handleSidebarClose} open={open} variant="temporary" />
      <main>
        {children}
        <Divider />
      </main>
      <FooterSplash />
    </Box>
  )
}

export default SplashLayout
