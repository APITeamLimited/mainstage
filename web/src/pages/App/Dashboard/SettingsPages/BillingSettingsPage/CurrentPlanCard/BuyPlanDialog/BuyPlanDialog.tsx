import { useEffect, useState } from 'react'

import { Button, Stack } from '@mui/material'
import {
  AllPlansQuery,
  TrialEligibilityQuery,
  TrialEligibilityQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { PaymentOnboardingDialog } from '../../PaymentOnboardingDialog'

type BuyPlanDialogProps = {
  open: boolean
  onClose: () => void
  allPlans: AllPlansQuery['planInfos']
}

const TRIAL_ELIGIBILITY_QUERY = gql`
  query TrialEligibilityQuery($teamId: String) {
    trialEligibility(teamId: $teamId)
  }
`

export const BuyPlanDialog = ({
  open,
  onClose,
  allPlans,
}: BuyPlanDialogProps) => {
  const upgradePlans = useUpgradePlans(allPlans)
  const trialEligibility = useTrialEligibility()
  const [activeFinalStep, setActiveFinalStep] = useState(0)

  useEffect(() => {
    if (!open) {
      setActiveFinalStep(0)
    }
  }, [open])

  return (
    <PaymentOnboardingDialog
      title="Upgrade Plan"
      open={open}
      onClose={onClose}
      activeFinalStep={activeFinalStep}
      finalSteps={[
        {
          stepName: 'planChoice',
          title: 'Select Plan',
          section: <Stack spacing={2}></Stack>,
          sectionButtons: (
            <>
              <Button variant="outlined" onClick={onClose} color="error">
                Cancel
              </Button>
            </>
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
