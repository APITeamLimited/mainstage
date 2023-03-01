import {
  useTheme,
  useScrollTrigger,
  Stack,
  Box,
  Container,
} from '@mui/material'

import { Head } from '@redwoodjs/web'

import { DialogsProvider } from 'src/components/app/dialogs'
import { BillingInfoProvider } from 'src/contexts/billing-info'
import { CancelRunningTestProvider } from 'src/contexts/cancel-running-test-provider'
import { ReactiveVarPersistor } from 'src/contexts/reactives/ReactiveVarPersistor'
import { EntityEngine } from 'src/entity-engine'
import { LocalTestManagerProvider } from 'src/test-manager/executors/local-test-manager/LocalTestManagerProvider'

import { CustomAppBar } from '../CustomAppBar'

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
  onDashboard?: boolean
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
  onDashboard,
}: AppLayoutProps) => {
  const theme = useTheme()

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  })

  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="favicon.png" />
      </Head>
      <EntityEngine>
        <BillingInfoProvider>
          <LocalTestManagerProvider>
            <CancelRunningTestProvider>
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
                  <CustomAppBar trigger={trigger}>{topNav}</CustomAppBar>
                )}
                {appBar && <CustomAppBar trigger>{appBar}</CustomAppBar>}
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
                  </main>
                </Box>
                {footer.element}
              </Stack>
            </CancelRunningTestProvider>
          </LocalTestManagerProvider>
        </BillingInfoProvider>
      </EntityEngine>
    </>
  )
}
