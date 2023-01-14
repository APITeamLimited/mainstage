import { useEffect, useState } from 'react'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Button, Grid, Stack, Typography } from '@mui/material'
import {
  AllPlansQuery,
  TrialEligibilityQuery,
  TrialEligibilityQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { PricingCard } from 'src/layouts/Landing/components/pricing/PricingCard'

import { PaymentOnboardingDialog } from '../../payment-components/PaymentOnboardingDialog'

import { PlanPaymentSection, SelectedPlanInfo } from './PlanPaymentSection'

type BuyPlanDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  allPlans: AllPlansQuery['planInfos']
}

const TRIAL_ELIGIBILITY_QUERY = gql`
  query TrialEligibilityQuery($teamId: String) {
    trialEligibility(teamId: $teamId)
  }
`

export const BuyPlanDialog = ({
  open,
  setOpen,
  allPlans,
}: BuyPlanDialogProps) => {
  const upgradePlans = useUpgradePlans(allPlans)
  const trialEligibility = useTrialEligibility()

  const [activeFinalStep, setActiveFinalStep] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlanInfo>(null)

  useAutoDialogOpen(setOpen)

  useEffect(() => {
    if (!open) {
      // Prevents visual errors
      setTimeout(() => setActiveFinalStep(0), 300)
      setSelectedPlan(null)
    }
  }, [open])

  return (
    <PaymentOnboardingDialog
      title="Upgrade Plan"
      open={open}
      onClose={() => setOpen(false)}
      activeFinalStep={activeFinalStep}
      finalSteps={[
        {
          stepName: 'planChoice',
          title: 'Select Plan',
          section: (
            <Stack
              spacing={2}
              alignItems="center"
              sx={{
                width: '100%',
              }}
              style={{
                marginLeft: 0,
              }}
            >
              {upgradePlans && (
                <Grid
                  spacing={2}
                  container
                  style={{
                    width: '100%',
                    marginTop: 0,
                    marginLeft: 0,
                  }}
                  alignItems="center"
                  justifyContent="center"
                >
                  {upgradePlans.map((planInfo) => (
                    <PricingCard
                      key={planInfo.id}
                      planInfo={planInfo}
                      pricingOption="annual"
                      mdWidth={6}
                      gridStyles={{
                        paddingLeft: 0,
                        paddingTop: 0,
                      }}
                      alreadyHadTrial={trialEligibility === 'ineligible'}
                      disableEmptyTrialPadding
                      splitPricing={{
                        onClickMonthly: () => {
                          setSelectedPlan({
                            planInfo,
                            pricingOption: 'monthly',
                          })
                          setActiveFinalStep(1)
                        },
                        onClickYearly: () => {
                          setSelectedPlan({
                            planInfo,
                            pricingOption: 'yearly',
                          })
                          setActiveFinalStep(1)
                        },
                      }}
                    />
                  ))}
                </Grid>
              )}
              {trialEligibility === 'ineligible' && (
                <Typography variant="body2" color="textSecondary">
                  You have already had a trial.
                </Typography>
              )}
            </Stack>
          ),
          sectionButtons: (
            <>
              <Button
                variant="outlined"
                onClick={() => setOpen(false)}
                color="error"
              >
                Cancel
              </Button>
            </>
          ),
        },
        {
          stepName: 'confirm',
          title: 'Confirm',
          section: (
            <PlanPaymentSection
              selectedPlan={selectedPlan}
              trialEligibility={
                selectedPlan?.planInfo.freeTrialDays
                  ? selectedPlan?.planInfo.freeTrialDays > 0 &&
                    trialEligibility === 'eligible'
                  : false
              }
              onPurchaseComplete={() => setActiveFinalStep(activeFinalStep + 1)}
            />
          ),
          sectionButtons: (
            <>
              <Button
                variant="outlined"
                onClick={() => setOpen(false)}
                color="error"
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setActiveFinalStep(activeFinalStep - 1)}
              >
                Go Back
              </Button>
            </>
          ),
        },
        {
          stepName: 'success',
          title: 'Success',
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
              <CheckCircleIcon
                color="success"
                sx={{
                  fontSize: 100,
                }}
              />
              <Typography variant="h5" align="center">
                You have successfully upgraded your plan!
              </Typography>
              <Typography variant="body2" align="center">
                Welcome to {selectedPlan?.planInfo.name}!
              </Typography>
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

const useUpgradePlans = (allPlans: AllPlansQuery['planInfos']) => {
  const planInfo = usePlanInfo()

  if (!planInfo) return null

  const currentPlan = allPlans.find((plan) => plan.id === planInfo.id)

  if (!currentPlan) return null

  return allPlans.filter(
    (plan) => plan.priceMonthlyCents > currentPlan.priceMonthlyCents
  )
}

export type UpgradePlansData = ReturnType<typeof useUpgradePlans>

const useTrialEligibility = () => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: trialEligibility } = useQuery<
    TrialEligibilityQuery,
    TrialEligibilityQueryVariables
  >(TRIAL_ELIGIBILITY_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
  })

  if (!trialEligibility) return null

  return trialEligibility?.trialEligibility ? 'eligible' : 'ineligible'
}

const useAutoDialogOpen = (setOpen: (open: boolean) => void) => {
  const [performedOpen, setPerformedOpen] = useState(false)

  // Use queryparameters
  const queryParams = new URLSearchParams(window.location.search)

  // Check for buyPlanId query parameter

  const showPlans = queryParams.get('showPlans')

  if (!showPlans || showPlans !== 'true') return

  // Check if already opened
  if (performedOpen) return

  // Open dialog
  setOpen(true)
  setPerformedOpen(true)
}
