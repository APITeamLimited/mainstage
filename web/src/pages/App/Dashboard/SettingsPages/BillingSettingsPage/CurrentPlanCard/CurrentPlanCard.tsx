import { useMemo, useState } from 'react'

import {
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { AllPlansQuery } from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { PlanChip } from 'src/components/app/utils/PlanChip'
import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useSubscription } from '../BillingProvider'

import { BuyPlanDialog } from './BuyPlanDialog'
import { DowngradePlanDialog } from './DowngradePlanDialog'
import { IndividualFeatures } from './IndividualFeatures'
import { SupportedLoadZones } from './SupportedLoadZones'

const ALL_PLANS = gql`
  query AllPlansQuery {
    planInfos {
      id
      name
      verboseName
      description
      maxMembers
      maxConcurrentCloudTests
      maxConcurrentScheduledTests
      monthlyCredits
      loadZones
      maxTestDurationMinutes
      dataRetentionMonths
      maxSimulatedUsers
      priceMonthlyCents
      priceYearlyCents
      freeTrialDays
    }
  }
`

const minCurrentPlanCardHeight = 522

export const CurrentPlanCard = () => {
  const workspaceInfo = useWorkspaceInfo()
  const planInfo = usePlanInfo()
  const canDowngrade = useCanDowngrade()

  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  const { data: allPlans } = useQuery<AllPlansQuery>(ALL_PLANS)

  const teamId = useMemo(
    () =>
      workspaceInfo.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo.scope]
  )

  const nextPlan = useMemo(() => {
    if (!planInfo || !allPlans) {
      return null
    }

    const currentPlanCost = planInfo.monthlyCredits

    const nextPlanUpgrade = [...allPlans.planInfos]
      .sort((a, b) => a.monthlyCredits - b.monthlyCredits)
      ?.find((plan) => plan.monthlyCredits > currentPlanCost)

    return nextPlanUpgrade ?? null
  }, [planInfo, allPlans])

  // Include allPlans to prevent flicker on load
  return planInfo && allPlans ? (
    <>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Plan
          </Typography>
          <Typography variant="body2">
            Your {teamId ? 'team' : 'account'} is currently on the{' '}
            <PlanChip name={planInfo.name} /> plan.
          </Typography>
          <Divider />
          <IndividualFeatures nextPlan={nextPlan} />
          <SupportedLoadZones nextPlan={nextPlan} />
          {(canDowngrade || !!nextPlan) && (
            <>
              <Divider />
              <Stack spacing={2} direction="row" justifyContent="flex-end">
                {canDowngrade && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setShowDowngradeDialog(true)}
                  >
                    Downgrade Plan
                  </Button>
                )}
                {nextPlan && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowUpgradeDialog(true)}
                  >
                    Upgrade to {nextPlan.name}
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Card>
      <BuyPlanDialog
        open={showUpgradeDialog && !!nextPlan}
        setOpen={setShowUpgradeDialog}
        allPlans={allPlans.planInfos}
      />
      <DowngradePlanDialog
        open={showDowngradeDialog}
        setOpen={setShowDowngradeDialog}
      />
    </>
  ) : (
    <Skeleton height={minCurrentPlanCardHeight} />
  )
}

const useCanDowngrade = () => {
  const planInfo = usePlanInfo()
  const { fetchedSubscription } = useSubscription()

  if (!planInfo || !fetchedSubscription) {
    return false
  }

  if (planInfo.priceMonthlyCents === 0) {
    return false
  }

  if (
    fetchedSubscription.cancel_at_period_end &&
    fetchedSubscription.current_period_end
  ) {
    return false
  }

  return true
}
