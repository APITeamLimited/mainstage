import { useState } from 'react'

import { Container } from '@mui/material'
import { useTheme, Box, useMediaQuery, useScrollTrigger } from '@mui/material'

import { CustomAppBar } from '../CustomAppBar'
import {
  FooterSplash,
  FOOTER_SPASH_HEIGHT,
} from '../Landing/components/FooterSplash'
import { LandingLayoutBase } from '../Landing/LandingLayoutBase'

import TopBarAdmin from './TopBarAdmin'
import TopNavAdmin from './TopNavAdmin'

export const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
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
      <TopNavAdmin />
      <CustomAppBar trigger={trigger}>
        <TopBarAdmin onSidebarOpen={handleSidebarOpen} />
      </CustomAppBar>
      {/*<Sidebar onClose={handleSidebarClose} open={open} variant="temporary" />*/}

      <main
        style={{
          paddingBottom: FOOTER_SPASH_HEIGHT,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container
          sx={{
            paddingY: 6,
            minHeight: '94vh',
          }}
        >
          {children}
        </Container>
      </main>
      <FooterSplash />
    </Box>
  )
}
