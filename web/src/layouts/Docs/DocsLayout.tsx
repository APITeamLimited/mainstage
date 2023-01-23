import { createContext, useContext, useMemo, useState } from 'react'

import {
  Chapter,
  DocsPage,
  searchForContent,
} from '@apiteam/types/src/docs/docs-lib'
import {
  Container,
  Paper,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
} from '@mui/material'

import { useLocation } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { APITeamLogo } from 'src/components/APITeamLogo'
import NotFoundCover from 'src/components/NotFoundCover'
import { TopBarPageName } from 'src/components/TopBarPageName'
import {
  DocsContentProvider,
  useDocsContent,
} from 'src/contexts/imports/docs-content-provider'

import { LandingTopBar } from '../Landing/components'
import {
  largePanelSpacing,
  mediumPanelSpacing,
  smallPanelSpacing,
} from '../Landing/components/constants'
import {
  FooterSplash,
  FOOTER_SPASH_HEIGHT,
} from '../Landing/components/FooterSplash'
import { LandingLayoutBase } from '../Landing/LandingLayoutBase'

import { DocsAside, docsAsideWidth } from './components/DocsAside'
import { DocsBreadcrumbs } from './components/DocsBreadcrumbs'
import { DocsSearch } from './components/DocsSearch'
import { NextPageLink } from './components/NextPageLink'
import { PageOverview } from './components/PageOverview'
import { DocHeadingsProvider } from './DocHeadingsProvider'

type DocsLayoutProps = {
  children?: React.ReactNode
}

const CurrentContentContext = createContext<Chapter | DocsPage | null>(null)
export const useCurrentContent = () => useContext(CurrentContentContext)

export const DocsLayout = (props: DocsLayoutProps) => {
  return (
    <DocsContentProvider>
      <DocsLayoutInner {...props} />
    </DocsContentProvider>
  )
}

const footerHeights = {
  xs: FOOTER_SPASH_HEIGHT.xs,
  md: FOOTER_SPASH_HEIGHT.md,
}

export const DocsLayoutInner = ({ children }: DocsLayoutProps) => {
  const theme = useTheme()

  const isMediumOrLess = useMediaQuery(theme.breakpoints.down('lg'))
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const { pathname } = useLocation()
  const docsContent = useDocsContent()

  const currentContent = useMemo(
    () => searchForContent(pathname, docsContent),
    [pathname, docsContent]
  )

  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (currentContent === null) {
    return <NotFoundCover />
  }

  return (
    <CurrentContentContext.Provider value={currentContent}>
      <DocHeadingsProvider>
        <MetaTags title={currentContent.title} />
        <LandingLayoutBase
          footer={{
            element: <FooterSplash />,
            height: footerHeights,
          }}
          appBarInner={
            <LandingTopBar
              onSidebarOpen={() => setSidebarOpen(true)}
              leftZone={isSmall ? <></> : <TopBarPageName name="Docs" />}
              rightZone={<DocsSearch />}
              hideBrandedRoutes
              hideSignUpOrContinueButton
              hideLogo={isSmall}
            />
          }
          topBarLeftZone={
            isSmall ? (
              <Stack spacing={2} alignItems="center" direction="row">
                <APITeamLogo />
                <TopBarPageName name="Docs" />
              </Stack>
            ) : (
              <></>
            )
          }
        >
          <Stack
            direction="row"
            sx={{
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <DocsAside
              open={sidebarOpen}
              setOpen={setSidebarOpen}
              footerHeights={footerHeights}
            />
            <Container
              sx={{
                paddingY: largePanelSpacing,
                minHeight: '94vh',
              }}
              disableGutters
            >
              <Stack
                spacing={
                  isMediumOrLess ? smallPanelSpacing : mediumPanelSpacing
                }
                direction="row"
              >
                <Stack
                  spacing={
                    isMediumOrLess ? smallPanelSpacing : mediumPanelSpacing
                  }
                  sx={{
                    flex: 1,
                  }}
                >
                  <DocsBreadcrumbs content={currentContent} />
                  <Typography variant="h4" fontWeight="bold">
                    {currentContent.title}
                  </Typography>
                  {isMediumOrLess && (
                    <Box
                      sx={{
                        maxWidth: '100%',
                      }}
                    >
                      <PageOverview />
                    </Box>
                  )}
                  <Paper
                    sx={{
                      padding: isMediumOrLess
                        ? smallPanelSpacing
                        : mediumPanelSpacing,
                    }}
                  >
                    <main>{children}</main>
                  </Paper>
                  <NextPageLink />
                </Stack>
                {!isMediumOrLess && (
                  <div>
                    <PageOverview />
                  </div>
                )}
              </Stack>
            </Container>
          </Stack>
        </LandingLayoutBase>
      </DocHeadingsProvider>
    </CurrentContentContext.Provider>
  )
}
