import React, { useState } from 'react'

import {
  useTheme,
  AppBar,
  Box,
  useMediaQuery,
  useScrollTrigger,
  Container,
} from '@mui/material'

import TopNav from 'src/layouts/Landing/components/TopNav'

import { Topbar, Sidebar } from './components/index'

type SplashLayoutProps = {
  children?: React.ReactNode
  footer: {
    element: React.ReactNode
    height: string | number
  }
}

export const LandingLayoutBase = ({ children, footer }: SplashLayoutProps) => {
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
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      <Container>
        <Box
          position={'relative'}
          zIndex={theme.zIndex.appBar - 1}
          sx={{
            padding: 2,
            paddingRight: 0,
          }}
        >
          <TopNav />
        </Box>
      </Container>
      <AppBar
        position={'sticky'}
        sx={{
          top: 0,
          backgroundColor: theme.palette.background.paper,
        }}
        elevation={trigger ? 1 : 0}
      >
        <Container
          sx={{
            py: 2,
          }}
        >
          <Topbar onSidebarOpen={handleSidebarOpen} />
        </Container>
      </AppBar>
      <Sidebar onClose={handleSidebarClose} open={open} variant="temporary" />
      <main
        style={{
          paddingBottom: footer.height,
        }}
      >
        {children}
      </main>
      {footer.element}
    </Box>
  )
}
