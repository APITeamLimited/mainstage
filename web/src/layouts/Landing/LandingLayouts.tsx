import { FooterSplash, FOOTER_SPASH_HEIGHT } from './components/FooterSplash'
import { LandingLayoutBase } from './LandingLayoutBase'
import { Container } from '@mui/material'

export const LandingLayoutSplash = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  return (
    <LandingLayoutBase
      footer={{ element: <FooterSplash />, height: FOOTER_SPASH_HEIGHT }}
      disableElevationTop={true}
    >
      {children}
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
      disableElevationTop={true}
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
