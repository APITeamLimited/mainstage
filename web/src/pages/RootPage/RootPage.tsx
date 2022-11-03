import { Box, Container, Stack, useTheme } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import EditorFeatures from 'src/pages/RootPage/components/EditorFeatures'
import GlobeTestOverview from 'src/pages/RootPage/components/GlobeTestOverview'
import PricingOverview from 'src/pages/RootPage/components/PricingOverview'
import PublishOverview from 'src/pages/RootPage/components/PublishOverview'
import TypedIntro from 'src/pages/RootPage/components/TypedIntro'

import { WhyUseAPITeam } from './components/WhyUseAPITeam'

const mainCardSpacing = 20

const RootPage = () => {
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
            spacing={mainCardSpacing}
            sx={{
              paddingY: mainCardSpacing,
            }}
          >
            <WhyUseAPITeam />
            <EditorFeatures />
            <GlobeTestOverview />
          </Stack>
        </Container>
      </Box>
      <PublishOverview />
      <PricingOverview />
    </>
  )
}

export default RootPage
