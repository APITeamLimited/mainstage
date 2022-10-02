import { useEffect, useState } from 'react'

import { Container } from '@mui/material'

import { useLocation } from '@redwoodjs/router'

import {
  FooterSplash,
  FOOTER_SPASH_HEIGHT,
} from '../Landing/components/FooterSplash'

import { AppLayoutBase } from './AppLayoutBase'
import { TopBarDashboard } from './components/TopBarDashboard'
import { TopNavApp } from './components/TopNavApp'

type AppUnifiedLayoutProps = {
  children?: React.ReactNode
}

export const AppUnifiedLayout = ({ children }: AppUnifiedLayoutProps) => {
  const { pathname } = useLocation()

  const [onDashboard, setOnDashboard] = useState(false)

  useEffect(() => {
    if (pathname.startsWith('/app/dashboard')) {
      if (!onDashboard) {
        setOnDashboard(true)
      }
    } else {
      if (onDashboard) {
        setOnDashboard(false)
      }
    }
  }, [onDashboard, pathname])

  return (
    <AppLayoutBase
      topNav={<TopNavApp />}
      appBar={onDashboard ? <TopBarDashboard /> : undefined}
      footer={
        onDashboard
          ? {
              element: <FooterSplash />,
              height: {
                xs: FOOTER_SPASH_HEIGHT.xs,
                md: FOOTER_SPASH_HEIGHT.md,
              },
            }
          : undefined
      }
    >
      {onDashboard ? (
        <Container
          sx={{
            paddingY: 6,
            minHeight: '94vh',
          }}
        >
          {children}
        </Container>
      ) : (
        children
      )}
    </AppLayoutBase>
  )
}
