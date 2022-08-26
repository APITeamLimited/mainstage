import { Container, useTheme, Box } from '@mui/material'

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
      disableTop={true}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
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
  return (
    <LandingLayoutBase
      footer={{
        element: <FooterSplash />,
        height: {
          xs: FOOTER_SPASH_HEIGHT.xs,
          md: FOOTER_SPASH_HEIGHT.md,
        },
      }}
    >
      <Container
        sx={{
          paddingY: 6,
          minHeight: '94vh',
        }}
      >
        {children}
      </Container>
    </LandingLayoutBase>
  )
}
