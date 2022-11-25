import React, { useState } from 'react'

import { useTheme, Box, useScrollTrigger } from '@mui/material'

import { Head } from '@redwoodjs/web'

import { TopNavLanding } from 'src/layouts/Landing/components/TopNavLanding'

import { CustomAppBar } from '../CustomAppBar'

import { LandingTopBar, Sidebar } from './components'

type SplashLayoutProps = {
  children?: React.ReactNode
  topBarLeftZone?: React.ReactNode
  appBarInner?: React.ReactNode | null
  footer: {
    element: React.ReactNode
    height: {
      xs: string | number
      md: string | number
    }
  }
  disableTop?: boolean
  backgroundColor?: string
  overflowIntoAppBar?: boolean
}

export const LandingLayoutBase = ({
  children,
  topBarLeftZone,
  footer,
  disableTop = false,
  appBarInner = null,
  backgroundColor,
  overflowIntoAppBar,
}: SplashLayoutProps) => {
  const theme = useTheme()

  const [openSidebar, setOpenSidebar] = useState(false)

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true)
  }

  const handleSidebarClose = (): void => {
    setOpenSidebar(false)
  }

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  })

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="favicon.png" />
      </Head>
      <Box
        sx={{
          backgroundColor: backgroundColor ?? theme.palette.background.paper,
          position: 'relative',
          minHeight: '100vh',
        }}
      >
        <TopNavLanding
          disableTop={disableTop}
          topBarLeftZone={topBarLeftZone}
        />
        <CustomAppBar disableTop={disableTop} trigger={trigger}>
          {appBarInner || <LandingTopBar onSidebarOpen={handleSidebarOpen} />}
        </CustomAppBar>
        <Sidebar
          onClose={handleSidebarClose}
          open={openSidebar}
          variant="temporary"
        />
        <Box
          sx={{
            paddingBottom: {
              xs: footer.height.xs,
              md: footer.height.md,
            },
            backgroundColor:
              backgroundColor ?? theme.palette.background.default,
            overflow: overflowIntoAppBar ? 'visible' : 'hidden',
          }}
        >
          <main
            style={{
              overflow: overflowIntoAppBar ? 'visible' : 'hidden',
            }}
          >
            {children}
          </main>
        </Box>
        {footer.element}
      </Box>
    </>
  )
}
