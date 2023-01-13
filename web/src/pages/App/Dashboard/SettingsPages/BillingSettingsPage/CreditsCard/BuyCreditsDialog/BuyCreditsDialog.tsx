import { useMemo, useState } from 'react'

import {
  CreditsPricingOptionsQuery,
  CreditsPricingOptionsQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { CustomLoadingDialog } from 'src/components/custom-mui/CustomLoadingDialog'
import { CREDITS_PRICING_OPTIONS_QUERY } from 'src/layouts/Landing/components/pricing'

import { PaymentOnboardingDialog } from '../../PaymentOnboardingDialog'

type BuyCreditsDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const BuyCreditsDialog = ({ open, setOpen }: BuyCreditsDialogProps) => {
  const [activeFinalStep, setActiveFinalStep] = useState(0)

  useAutoDialogOpen(setOpen)

  const { data } = useQuery<
    CreditsPricingOptionsQuery,
    CreditsPricingOptionsQueryVariables
  >(CREDITS_PRICING_OPTIONS_QUERY, {
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-only', // Used for subsequent executions
  })

  const creditsPricingOption = useMemo(() => {
    if (!data) {
      return null
    }

    if (data.creditsPricingOptions.length === 0) {
      throw new Error('No credits pricing options found')
    }

    return data.creditsPricingOptions[0]
  }, [data])

  if (!creditsPricingOption) {
    return (
      <CustomLoadingDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Buy Credits"
      />
    )
  }

  return (
    <></>
    // <PaymentOnboardingDialog
    //   title="Buy Credits"
    //   open={open}
    //   onClose={() => setOpen(false)}
    //   activeFinalStep={0}
    //   finalSteps={[]}
    // />
  )
}

const useAutoDialogOpen = (setOpen: (open: boolean) => void) => {
  const [performedOpen, setPerformedOpen] = useState(false)

  // Use queryparameters
  const queryParams = new URLSearchParams(window.location.search)

  // Check for showBuyCredits query parameter

  const showBuyCredits = queryParams.get('showBuyCredits')

  if (!showBuyCredits || showBuyCredits !== 'true') return

  // Check if already opened
  if (performedOpen) return

  // Open dialog
  setOpen(true)
  setPerformedOpen(true)
}
