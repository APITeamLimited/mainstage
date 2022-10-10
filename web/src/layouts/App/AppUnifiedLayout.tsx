import { useEffect, useState } from 'react'

import { Container } from '@mui/material'

import { useLocation } from '@redwoodjs/router'

import {
  getLexicalAddons,
  getLexicalModule,
} from 'src/components/app/EnvironmentManager/EnvironmentTextField/module'
import {
  DnDModuleProvider,
  Lib0ModuleProvider,
  HashSumModuleProvider,
  SimplebarReactModuleProvider,
} from 'src/contexts/imports'
import { YJSModuleProvider } from 'src/contexts/imports'

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

  // Pre-load dynamic imports
  useEffect(() => {
    getLexicalModule()
    getLexicalAddons()
    import('mime-types')
    import('prettier/standalone')
    import('prettier/parser-babel')
    import('httpsnippet')
    import('react-apexcharts')
    import('hash-sum')
    import('simplebar-react')
  }, [])

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
    <Lib0ModuleProvider>
      <HashSumModuleProvider>
        <SimplebarReactModuleProvider>
          <YJSModuleProvider>
            <DnDModuleProvider>
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
            </DnDModuleProvider>
          </YJSModuleProvider>
        </SimplebarReactModuleProvider>
      </HashSumModuleProvider>
    </Lib0ModuleProvider>
  )
}
