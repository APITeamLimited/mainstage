import { useEffect, useMemo, useState } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Button, Stack, Typography } from '@mui/material'
import {
  CreditsPricingOptionsQuery,
  CreditsPricingOptionsQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { CustomLoadingDialog } from 'src/components/custom-mui/CustomLoadingDialog'
import { CREDITS_PRICING_OPTIONS_QUERY } from 'src/layouts/Landing/components/pricing'

import { PaymentOnboardingDialog } from '../../payment-components/PaymentOnboardingDialog'

import { CreditsPaymentSection } from './CreditsPaymentSection'

type BuyCreditsDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const BuyCreditsDialog = ({ open, setOpen }: BuyCreditsDialogProps) => {
  const [activeFinalStep, setActiveFinalStep] = useState(0)

  const [paymentLink, setPaymentLink] = useState<string | null>(null)

  useAutoDialogOpen(setOpen)

  useEffect(() => {
    if (!open) {
      // Prevents visual errors
      setTimeout(() => setActiveFinalStep(0), 300)
    }
  }, [open])

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
    <PaymentOnboardingDialog
      title="Buy Credits"
      open={open}
      onClose={() => setOpen(false)}
      activeFinalStep={activeFinalStep}
      finalSteps={[
        {
          stepName: 'confirm',
          title: 'Confirm',
          section: (
            <CreditsPaymentSection
              creditsPricingOption={creditsPricingOption}
              onPurchaseComplete={(paymentLink) => {
                setPaymentLink(paymentLink)
                setActiveFinalStep(activeFinalStep + 1)
              }}
            />
          ),
          sectionButtons: (
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              color="error"
            >
              Cancel
            </Button>
          ),
        },
        {
          stepName: 'success',
          title: paymentLink ? 'Final Step' : 'Success',
          section: (
            <Stack
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{
                width: '100%',
                height: 300,
              }}
            >
              {paymentLink ? (
                <>
                  <Typography variant="h5" align="center">
                    Further Action Required
                  </Typography>
                  <Typography variant="body2" align="center">
                    One last step. We couldn&apos;t process your payment
                    automatically. Please click the button below to complete
                    your payment.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.open(paymentLink, '_blank')?.focus()}
                  >
                    Complete Payment
                  </Button>
                </>
              ) : (
                <>
                  <CheckCircleIcon
                    color="success"
                    sx={{
                      fontSize: 100,
                    }}
                  />
                  <Typography variant="h5" align="center">
                    Successfully Purchased Credits
                  </Typography>
                  <Typography variant="body2" align="center">
                    These are now available to use immediately.
                  </Typography>
                </>
              )}
            </Stack>
          ),
          sectionButtons: (
            <Button
              variant="contained"
              onClick={() => setOpen(false)}
              color="primary"
            >
              Close
            </Button>
          ),
        },
      ]}
    />
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
