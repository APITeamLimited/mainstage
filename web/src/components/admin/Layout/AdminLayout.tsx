import { useState } from 'react'

import {
  useTheme,
  useMediaQuery,
  useScrollTrigger,
  Container,
  Box,
  Stack,
} from '@mui/material'
import { LayoutProps } from 'react-admin'

import { CustomAppBar } from 'src/layouts/CustomAppBar'

import { SideBarAdmin } from './SideBarAdmin'
import { SideCardAdmin } from './SideCardAdmin'
import TopBarAdmin from './TopBarAdmin'

export const AdminLayout = ({ children }: LayoutProps) => {
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

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  })

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <CustomAppBar trigger={trigger}>
        <TopBarAdmin onSidebarOpen={handleSidebarOpen} />
      </CustomAppBar>
      <SideBarAdmin
        open={isMd ? false : openSidebar}
        onClose={handleSidebarClose}
        variant="temporary"
      />
      <Container
        sx={{
          backgroundColor: theme.palette.background.default,
          paddingY: 6,
        }}
      >
        <main>
          <Stack direction="row" spacing={6}>
            {isMd && <SideCardAdmin />}
            <Box
              sx={{
                justifyContent: 'center',
                display: 'flex',
                width: '100%',
              }}
            >
              {children}
            </Box>
          </Stack>
        </main>
      </Container>
    </Box>
  )
}
