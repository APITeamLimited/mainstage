import { Container, useTheme, Box, alpha } from '@mui/material'

import { Blur } from './components/Blur'
import { panelSeparation } from './components/constants'
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
        element: <FooterSplash transparent />,
        height: {
          xs: FOOTER_SPASH_HEIGHT.xs,
          md: FOOTER_SPASH_HEIGHT.md,
        },
      }}
      disableTop
      backgroundColor={theme.palette.background.paper}
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
            height: '100vh',
            filter: 'blur(10px)',
            borderColor: 'transparent',
            objectFit: 'fill',
            borderWidth: '20px',

            // Fade out the image at the bottom
            maskImage: `linear-gradient(to bottom, ${alpha(
              theme.palette.background.paper,
              0
            )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          }}
        />
      </Box>
      <Blur />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {children}
      </div>
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
        element: <FooterSplash transparent />,
        height: {
          xs: FOOTER_SPASH_HEIGHT.xs,
          md: FOOTER_SPASH_HEIGHT.md,
        },
      }}
      disableTop
      backgroundColor={theme.palette.background.paper}
    >
      <Blur />
      <Container
        sx={{
          paddingTop: panelSeparation / 2,
          paddingBottom: panelSeparation,
          minHeight: '94vh',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 2,
          }}
        >
          {children}
        </div>
      </Container>
    </LandingLayoutBase>
  )
}
