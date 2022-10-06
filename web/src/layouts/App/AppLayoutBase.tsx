import { useEffect } from 'react'

import { useTheme, useScrollTrigger, Stack, Box } from '@mui/material'

import { BrowserOnly } from '@redwoodjs/prerender/browserUtils'

import { DialogsProvider } from 'src/components/app/dialogs'
import {
  getLexicalAddons,
  getLexicalModule,
} from 'src/components/app/EnvironmentManager/EnvironmentTextField/module'
import { ReactiveVarPersistor } from 'src/contexts/reactives/ReactiveVarPersistor'
import { EntityEngine } from 'src/entity-engine'
import { useSyncReady } from 'src/entity-engine/EntityEngine'

import { CustomAppBar } from '../CustomAppBar'

import { NotConnectedBanner } from './components/NotConnectedBanner'

type AppLayoutProps = {
  children?: React.ReactNode
  topNav?: React.ReactNode
  appBar?: React.ReactNode | undefined
  footer?: {
    element: React.ReactNode
    height: {
      xs: string | number
      md: string | number
    }
  }
}

export const AppLayoutBase = ({
  children,
  topNav = <></>,
  appBar = undefined,
  footer = {
    element: <></>,
    height: {
      xs: 0,
      md: 0,
    },
  },
}: AppLayoutProps) => {
  const theme = useTheme()

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
  }, [])

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  })

  return (
    <BrowserOnly>
      <EntityEngine>
        <DialogsProvider />
        <ReactiveVarPersistor />
        <Stack
          sx={{
            backgroundColor: theme.palette.background.default,
            position: 'relative',
            minHeight: '100vh',
          }}
        >
          {appBar ? (
            topNav
          ) : (
            <CustomAppBar trigger={trigger} disableTop={false}>
              {topNav}
            </CustomAppBar>
          )}
          {appBar && (
            <CustomAppBar trigger={trigger} disableTop={false}>
              {appBar}
            </CustomAppBar>
          )}
          <Box
            sx={{
              paddingBottom: {
                xs: footer.height.xs,
                md: footer.height.md,
              },
              backgroundColor: theme.palette.background.default,
            }}
          >
            <main>
              <InnerLayout>{children}</InnerLayout>
            </main>
          </Box>
          {footer.element}
        </Stack>
      </EntityEngine>
    </BrowserOnly>
  )
}

const InnerLayout = ({ children }: { children?: React.ReactNode }) => {
  const syncReady = useSyncReady()

  const shouldDisable =
    syncReady.socketioProvider === 'connecting' ||
    syncReady.socketioProvider === 'disconnected' ||
    syncReady.indexeddbProvider === 'connecting' ||
    syncReady.indexeddbProvider === 'disconnected'

  return <>{shouldDisable ? <NotConnectedBanner /> : children}</>
}
