import { Box, Container, Stack, useTheme } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import EditorFeatures from 'src/pages/SplashPage/components/EditorFeatures'
import GlobeTestOverview from 'src/pages/SplashPage/components/GlobeTestOverview'
import PricingOverview from 'src/pages/SplashPage/components/PricingOverview'
import PublishOverview from 'src/pages/SplashPage/components/PublishOverview'
import TypedIntro from 'src/pages/SplashPage/components/TypedIntro'

import { WhyUseAPITeam } from './components/WhyUseAPITeam'

const SplashPage = () => {
  const theme = useTheme()

  return (
    <>
      <MetaTags
        title="Free Unlimited Team API Development"
        description="APITeam is an all in one platform for designing, testing and scaling APIs collaboratively"
      />
      <TypedIntro />
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          zIndex: 1,
          position: 'relative',
        }}
      >
        <Container
          sx={{
            overflow: 'hidden',
            zIndex: 1,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack
            spacing={panelSeparation}
            sx={{
              paddingY: panelSeparation,
            }}
          >
            <WhyUseAPITeam />
            <EditorFeatures />
            <GlobeTestOverview />
          </Stack>
        </Container>
      </Box>
      {/*
      <PublishOverview />
      <PricingOverview />
      */}
    </>
  )
}

export default SplashPage
