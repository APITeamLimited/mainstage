import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'

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
import { entityEngineStatusVar } from 'src/entity-engine/EntityEngine'

import {
  FooterSplash,
  FOOTER_SPASH_HEIGHT,
} from '../Landing/components/FooterSplash'

import { AppLayoutBase } from './AppLayoutBase'
import { LoadingScreen } from './components/LoadingScreen'
import { OnDashboardWrapper } from './components/OnDashboardWrapper'
import { TopBarDashboard } from './components/TopBarDashboard'
import { TopNavApp } from './components/TopNavApp'

type AppUnifiedLayoutProps = {
  children?: React.ReactNode
}

export const AppUnifiedLayout = ({ children }: AppUnifiedLayoutProps) => {
  const { pathname } = useLocation()

  const [onDashboard, setOnDashboard] = useState(false)

  const [loadedImports, setLoadedImports] = useState(false)
  const entityEngineStatus = useReactiveVar(entityEngineStatusVar)

  const [isLoading, setIsLoading] = useState(true)
  const [displayLoading, setDisplayLoading] = useState(true)

  useEffect(() => {
    let loaded =
      loadedImports &&
      (entityEngineStatus === 'connected' ||
        entityEngineStatus === 'disconnected')

    if (entityEngineStatus === 'connecting') {
      loaded = false
    }

    setIsLoading(!loaded)
  }, [loadedImports, entityEngineStatus, isLoading])

  useEffect(() => {
    if (isLoading) {
      setDisplayLoading(true)
    } else {
      setTimeout(() => {
        setDisplayLoading(false)
      }, 1000)
    }
  }, [isLoading])

  // Pre-load dynamic imports
  useEffect(() => {
    const load = async () => {
      await Promise.all([
        getLexicalModule(),
        getLexicalAddons(),
        import('mime-types'),
        import('prettier/standalone'),
        import('prettier/parser-babel'),
        import('httpsnippet'),
        import('react-apexcharts'),
        import('hash-sum'),
        import('simplebar-react'),
        import('@monaco-editor/react'),

        new Promise((resolve) => {
          import('@monaco-editor/loader').then((module) => {
            module.default.init().then(resolve)
          })
        }),

        // Import pages so app is snappy
        import('src/pages/App/CollectionEditorPage'),
        import('src/pages/App/Dashboard/OverviewPage'),
        import('src/pages/App/Dashboard/DomainsPage'),
        import('src/pages/App/Dashboard/SettingsPages/GeneralSettingsPage'),
        import('src/pages/App/Dashboard/SettingsPages/MembersSettingsPage'),
        import('src/pages/App/Dashboard/SettingsPages/DangerZoneSettingsPage'),
      ])

      setLoadedImports(true)
    }
    load()
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
    <>
      {displayLoading && <LoadingScreen />}
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
                  onDashboard={onDashboard}
                >
                  {children}
                </AppLayoutBase>
              </DnDModuleProvider>
            </YJSModuleProvider>
          </SimplebarReactModuleProvider>
        </HashSumModuleProvider>
      </Lib0ModuleProvider>
    </>
  )
}
