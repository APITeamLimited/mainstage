import React, { useState } from 'react'

import { useTheme, Box, useScrollTrigger } from '@mui/material'

import { TopNavLanding } from 'src/layouts/Landing/components/TopNavLanding'

import { CustomAppBar } from '../CustomAppBar'

import { Topbar, Sidebar } from './components/index'

type SplashLayoutProps = {
  children?: React.ReactNode
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
}

export const LandingLayoutBase = ({
  children,
  footer,
  disableTop = false,
  appBarInner = null,
  backgroundColor,
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
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      <TopNavLanding disableTop={disableTop} />
      <CustomAppBar disableTop={disableTop} trigger={trigger}>
        {appBarInner || <Topbar onSidebarOpen={handleSidebarOpen} />}
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
          backgroundColor: backgroundColor ?? theme.palette.background.default,
        }}
      >
        <main>{children}</main>
      </Box>
      {footer.element}
    </Box>
  )
}
