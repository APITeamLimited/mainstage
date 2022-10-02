import { MetaTags } from '@redwoodjs/web'

import EditorFeatures from 'src/pages/RootPage/components/EditorFeatures'
import GlobeTestOverview from 'src/pages/RootPage/components/GlobeTestOverview'
import PricingOverview from 'src/pages/RootPage/components/PricingOverview'
import PublishOverview from 'src/pages/RootPage/components/PublishOverview'
import TypedIntro from 'src/pages/RootPage/components/TypedIntro'

const RootPage = () => (
  <>
    <MetaTags
      title="Free Unlimited Team API Development"
      description="APITeam is an all in one platform for designing, testing and scaling your APIs collaboratively"
    />
    <TypedIntro />
    <EditorFeatures />
    {/*<GlobeTestOverview />*/}
    {/*<PublishOverview />*/}
    {/*<PricingOverview />*/}
  </>
)

export default RootPage
