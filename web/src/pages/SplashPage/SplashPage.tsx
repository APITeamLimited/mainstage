import { useRef } from 'react'

import { alpha, Box, Container, Stack, useTheme } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { Blur } from 'src/layouts/Landing/components/BlurProvider'
import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { PricingOverview } from 'src/layouts/Landing/components/pricing'
import EditorFeatures from 'src/pages/SplashPage/components/EditorFeatures'
import GlobeTestOverview from 'src/pages/SplashPage/components/GlobeTestOverview'
import TypedIntro from 'src/pages/SplashPage/components/TypedIntro'
import { ThemeInverter } from 'src/utils/ThemeInverter'

import { GlobalTestingNetwork } from './components/GlobalTestingNetwork'
import { WhyUseAPITeam } from './components/WhyUseAPITeam'

const SplashPage = () => {
  const whyUseAPITeamRef = useRef<HTMLDivElement>(null)

  const theme = useTheme()

  return (
    <>
      <MetaTags
        title="Develop and Load Test APIs Collaboratively"
        description="APITeam is an all in one platform for designing, testing and scaling APIs collaboratively"
      />
      <TypedIntro whyUseAPITeamRef={whyUseAPITeamRef} />
      <Stack
        spacing={panelSeparation}
        sx={{
          paddingY: panelSeparation,
          width: '100%',
        }}
        alignItems="center"
      >
        <Container>
          <WhyUseAPITeam locationRef={whyUseAPITeamRef} />
        </Container>
        <Container>
          <EditorFeatures />
        </Container>
        <GlobalTestingNetwork />
        {/* <Box
          sx={{
            paddingY: panelSeparation / 2,
            background: `radial-gradient(circle at 50% 50%,${alpha(
              theme.palette.primary.main,
              0.1
            )}, ${alpha(theme.palette.primary.light, 0.0)})`,
            width: '100%',
          }}
        > */}
        <GlobeTestOverview />
        <PricingOverview showLinkToPricingPage />
      </Stack>
    </>
  )
}

export default SplashPage
