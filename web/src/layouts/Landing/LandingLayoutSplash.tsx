import { FooterSplash, FOOTER_SPASH_HEIGHT } from './components/FooterSplash'
import { LandingLayoutBase } from './LandingLayoutBase'

export const LandingLayoutSplash = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  return (
    <LandingLayoutBase
      footer={{ element: <FooterSplash />, height: FOOTER_SPASH_HEIGHT }}
    >
      {children}
    </LandingLayoutBase>
  )
}
