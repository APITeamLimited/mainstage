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
      footer={{ element: <FooterSplash />, height: FOOTER_SPASH_HEIGHT }}
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
      footer={{ element: <FooterSplash />, height: FOOTER_SPASH_HEIGHT }}
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
