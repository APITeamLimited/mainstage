import { createContext } from 'react'

import {
  useTheme,
  AppBar,
  Box,
  useScrollTrigger,
  Stack,
  Divider,
} from '@mui/material'

import { DialogsProvider } from 'src/components/app/dialogs'
import { ReactiveVarPersistor } from 'src/contexts/reactives/ReactiveVarPersistor'
import { EntityEngine } from 'src/entity-engine'
import { useSyncReady } from 'src/entity-engine/EntityEngine'

import { NotConnectedBanner } from './components/NotConnectedBanner'
import { TopNav } from './components/TopNav'

export const AppBarHeightContext = createContext<number>(60)
type AppLayoutProps = {
  children?: React.ReactNode
  topNav?: React.ReactNode
  appBar: React.ReactNode
  footer: {
    element: React.ReactNode
    height: string | number
  }
  disableElevationTop?: boolean
  dividerOnTop?: boolean
}

export const AppLayoutBase = ({
  children,
  topNav = <></>,
  appBar,
  footer = {
    element: <></>,
    height: 0,
  },
  disableElevationTop = false,
  dividerOnTop = false,
}: AppLayoutProps) => {
  const theme = useTheme()

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  })

  return (
    <EntityEngine>
      <DialogsProvider>
        <ReactiveVarPersistor />
        <Stack
          sx={{
            backgroundColor: theme.palette.background.default,
            position: 'relative',
            minHeight: '100vh',
          }}
        >
          {topNav}
          <AppBar
            position={'sticky'}
            sx={{
              top: 0,
              backgroundColor: theme.palette.background.paper,
              // Prevent app bar form changing color by applying desired linearGradien
              // all the time
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
              // Disable shaddow on top of appbar
              clipPath: `inset(1 0px -20px 0px)`,
            }}
            elevation={trigger ? 8 : disableElevationTop ? 0 : 8}
          >
            {appBar}
            {dividerOnTop && !trigger && <Divider />}
          </AppBar>
          <main
            style={{
              paddingBottom: footer.height,
            }}
          >
            <InnerLayout>{children}</InnerLayout>
          </main>
          {footer.element}
        </Stack>
      </DialogsProvider>
    </EntityEngine>
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

export const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <AppLayoutBase
      topNav={<TopNav />}
      appBar={<h1>a</h1>}
      footer={{
        element: <></>,
        height: 0,
      }}
    >
      {children}
    </AppLayoutBase>
  )
}
