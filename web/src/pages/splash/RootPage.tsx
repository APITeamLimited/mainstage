import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import EditorFeatures from 'src/components/splash/EditorFeatures'
import GlobeTestOverview from 'src/components/splash/GlobeTestOverview'
import PricingOverview from 'src/components/splash/PricingOverview'
import PublishOverview from 'src/components/splash/PublishOverview'
import TypedIntro from 'src/components/splash/TypedIntro'

const RootPage = () => {
  // TODO: this is temporary until production is ready
  /*const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    navigate(routes.dashboard())
  }*/

  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for designing, testing and scaling your APIs collaboratively"
      />
      <main>
        <TypedIntro />
        <EditorFeatures />
        <GlobeTestOverview />
        <PublishOverview />
        <PricingOverview />
      </main>
    </>
  )
}

export default RootPage
