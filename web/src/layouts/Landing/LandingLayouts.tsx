import { Container, useTheme, Box } from '@mui/material'

import { largePanelSpacing, panelSeparation } from './components/constants'
import { FooterSplash, FOOTER_SPASH_HEIGHT } from './components/FooterSplash'
import { LandingLayoutBase } from './LandingLayoutBase'

export const LandingLayoutSplash = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const theme = useTheme()

  return (
    <LandingLayoutBase
      footer={{
        element: <FooterSplash />,
        height: {
          xs: FOOTER_SPASH_HEIGHT.xs,
          md: FOOTER_SPASH_HEIGHT.md,
        },
      }}
      disableTop
      backgroundColor="transparent"
      overflowIntoAppBar
    >
      <Box
        sx={{
          display: 'block',
          position: 'absolute',
          width: '100%',
          right: 0,
          textAlign: 'right',
          top: 0,
        }}
      >
        <img
          src={
            theme.palette.mode == 'light'
              ? require('public/img/splash/collection-editor-light.png')
              : require('public/img/splash/collection-editor-dark.png')
          }
          alt="Splash demo"
          style={{
            width: '100%',
            overflow: 'hidden',
            height: '120vh',
            filter: 'blur(8px)',
            borderColor: 'transparent',
            objectFit: 'fill',
            borderWidth: '20px',
          }}
        />
      </Box>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          overflow: 'visible',
        }}
      >
        {children}
      </Box>
    </LandingLayoutBase>
  )
}

export const LandingLayoutContained = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const theme = useTheme()

  return (
    <LandingLayoutBase
      footer={{
        element: <FooterSplash />,
        height: {
          xs: FOOTER_SPASH_HEIGHT.xs,
          md: FOOTER_SPASH_HEIGHT.md,
        },
      }}
      disableTop
    >
      <Box sx={{ backgroundColor: theme.palette.background.paper }}>
        <Container
          sx={{
            paddingTop: largePanelSpacing,
            paddingBottom: panelSeparation,
            minHeight: '94vh',
          }}
        >
          {children}
        </Container>
      </Box>
    </LandingLayoutBase>
  )
}
