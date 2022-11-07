import { createContext, useContext, useMemo } from 'react'

import {
  Chapter,
  DocsPage,
  searchForContent,
} from '@apiteam/types/src/docs/docs-lib'
import { Container, Paper, Stack, Typography } from '@mui/material'

import { useLocation } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

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
  panelSeparation,
  smallPanelSpacing,
} from '../Landing/components/constants'
import {
  FooterSplash,
  FOOTER_SPASH_HEIGHT,
} from '../Landing/components/FooterSplash'
import { LandingLayoutBase } from '../Landing/LandingLayoutBase'

import { DocsBreadcrumbs } from './components/DocsBreadcrumbs'
import { DocsSearch } from './components/DocsSearch'

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

export const DocsLayoutInner = ({ children }: DocsLayoutProps) => {
  const { pathname } = useLocation()

  const docsContent = useDocsContent()

  const currentContent = useMemo(
    () => searchForContent(pathname, docsContent),
    [pathname, docsContent]
  )

  const handleSidebarOpen = () => {}

  if (currentContent === null) {
    return <NotFoundCover />
  }

  return (
    <CurrentContentContext.Provider value={currentContent}>
      <MetaTags title={currentContent.title} />
      <LandingLayoutBase
        footer={{
          element: <FooterSplash />,
          height: {
            xs: FOOTER_SPASH_HEIGHT.xs,
            md: FOOTER_SPASH_HEIGHT.md,
          },
        }}
        appBarInner={
          <LandingTopBar
            onSidebarOpen={handleSidebarOpen}
            leftZone={<TopBarPageName name="Docs" />}
            rightZone={<DocsSearch />}
            hideBrandedRoutes
            hideSignUpOrContinueButton
          />
        }
      >
        <Container
          sx={{
            paddingTop: largePanelSpacing,
            paddingBottom: panelSeparation,
            minHeight: '94vh',
          }}
        >
          <Stack spacing={mediumPanelSpacing}>
            <DocsBreadcrumbs content={currentContent} />
            <Typography variant="h4" fontWeight="bold">
              {currentContent.title}
            </Typography>
            <Paper
              sx={{
                padding: {
                  xs: smallPanelSpacing,
                  md: mediumPanelSpacing,
                },
              }}
            >
              {children}
            </Paper>
          </Stack>
        </Container>
      </LandingLayoutBase>
    </CurrentContentContext.Provider>
  )
}
