import { Typography, useTheme, Box } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { PricingOverview } from 'src/layouts/Landing/components/pricing'

const PlansAndPricingPage = () => {
  const theme = useTheme()

  return (
    <>
      <MetaTags title="Plans and Pricing" />
      <PricingOverview showCreditsPricingOption />
    </>
  )
}

export default PlansAndPricingPage
