import { useState } from 'react'

import {
  useTheme,
  AppBar,
  Box,
  Divider,
  useMediaQuery,
  useScrollTrigger,
  Container,
} from '@mui/material'

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
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
        }}
        elevation={1}
        component="nav"
      >
        <Container
          sx={{
            py: 2,
          }}
        ></Container>
      </AppBar>
      <main>{children}</main>
    </Box>
  )
}

export default AppLayout
