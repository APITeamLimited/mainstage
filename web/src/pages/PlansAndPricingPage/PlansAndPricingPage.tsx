import { MetaTags } from '@redwoodjs/web'

import { PricingOverview } from 'src/layouts/Landing/components/pricing'

const PlansAndPricingPage = () => {
  return (
    <>
      <MetaTags title="Plans and Pricing" />
      <PricingOverview showCreditsPricingOption />
    </>
  )
}

export default PlansAndPricingPage
