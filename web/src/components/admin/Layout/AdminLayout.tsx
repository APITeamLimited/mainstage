import { useState } from 'react'
import {
  useTheme,
  useMediaQuery,
  useScrollTrigger,
  Container,
  Box,
} from '@mui/material'
import { CustomAppBar } from 'src/layouts/CustomAppBar'
import TopBarAdmin from './TopBarAdmin'
import { Sidebar, Menu, LayoutProps } from 'react-admin'
import { SideBarAdmin } from './SideBarAdmin'

export const AdminLayout = ({ dashboard, children }: LayoutProps) => {
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
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <CustomAppBar trigger={trigger}>
        <TopBarAdmin onSidebarOpen={handleSidebarOpen} />
      </CustomAppBar>
      <SideBarAdmin open={openSidebar} onClose={handleSidebarClose} variant='temporary' />
      <Container
        sx={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <main>
            {children}
          </main>
      </Container>
    </Box>
  )
}
