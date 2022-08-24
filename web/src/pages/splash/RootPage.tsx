import { MetaTags } from '@redwoodjs/web'

import EditorFeatures from 'src/pages/splash/components/EditorFeatures'
import GlobeTestOverview from 'src/pages/splash/components/GlobeTestOverview'
import PricingOverview from 'src/pages/splash/components/PricingOverview'
import PublishOverview from 'src/pages/splash/components/PublishOverview'
import TypedIntro from 'src/pages/splash/components/TypedIntro'

const RootPage = () => (
  <>
    <MetaTags
      title="APITeam | Free Unlimited Team API Development"
      description="APITeam is an all in one platform for designing, testing and scaling your APIs collaboratively"
    />
    <main style={{
      overflowX: 'hidden',
    }}>
      <TypedIntro />
      <EditorFeatures />
      <GlobeTestOverview />
      <PublishOverview />
      <PricingOverview />
    </main>
  </>
)

export default RootPage
