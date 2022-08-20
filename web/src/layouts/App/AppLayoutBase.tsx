import { createContext, useContext, useRef } from 'react'

import { useTheme, useScrollTrigger, Stack } from '@mui/material'

import { DialogsProvider } from 'src/components/app/dialogs'
import { ReactiveVarPersistor } from 'src/contexts/reactives/ReactiveVarPersistor'
import { EntityEngine } from 'src/entity-engine'
import { useSyncReady } from 'src/entity-engine/EntityEngine'

import { CustomAppBar } from './components/CustomAppBar'
import { NotConnectedBanner } from './components/NotConnectedBanner'

type AppLayoutProps = {
  children?: React.ReactNode
  topNav?: React.ReactNode
  appBar?: React.ReactNode | null
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
  appBar = null,
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
          {appBar ? (
            topNav
          ) : (
            <CustomAppBar
              appBar={topNav}
              trigger={trigger}
              dividerOnTop={dividerOnTop}
              disableElevationTop={disableElevationTop}
            />
          )}
          {appBar && (
            <CustomAppBar
              appBar={appBar}
              trigger={trigger}
              disableElevationTop={disableElevationTop}
              dividerOnTop={dividerOnTop}
            />
          )}
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
