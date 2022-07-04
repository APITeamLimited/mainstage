import { Box, Container } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import EditorFeatures from 'src/components/splash/EditorFeatures'
import GlobeTestOverview from 'src/components/splash/GlobeTestOverview'
import PricingOverview from 'src/components/splash/PricingOverview'
import PublishOverview from 'src/components/splash/PublishOverview'
import TypedIntro from 'src/components/splash/TypedIntro'

const RootPage = () => {
  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for building, testing and scaling your APIs collaboratively."
      />
      <Box>
        <TypedIntro />
        <EditorFeatures />
        <GlobeTestOverview />
        <PublishOverview />
        <PricingOverview />
      </Box>
    </>
  )
}

export default RootPage
