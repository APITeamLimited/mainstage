import { Container } from '@mui/material'

import { TopBarDashboard } from 'src/pages/app/dashboard/TopBarDashboard'

import {
  FooterSplash,
  FOOTER_SPASH_HEIGHT,
} from '../Landing/components/FooterSplash'

import { AppLayoutBase } from './AppLayout'
import { TopNav } from './components/TopNav'

type AppDashboardLayoutProps = {
  children?: React.ReactNode
}

export const AppDashboardLayout = ({ children }: AppDashboardLayoutProps) => {
  return (
    <AppLayoutBase
      topNav={<TopNav />}
      appBar={<TopBarDashboard />}
      footer={{
        element: <FooterSplash />,
        height: FOOTER_SPASH_HEIGHT,
      }}
      disableElevationTop={true}
      dividerOnTop={true}
    >
      <Container
        sx={{
          paddingY: 6,
          minHeight: '94vh',
        }}
      >
        {children}
      </Container>
    </AppLayoutBase>
  )
}
