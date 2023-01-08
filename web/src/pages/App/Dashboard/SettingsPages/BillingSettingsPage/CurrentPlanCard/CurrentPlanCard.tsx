import { useMemo } from 'react'

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

import { IndividualFeatures } from './IndividualFeatures'
import { SupportedLoadZones } from './SupportedLoadZones'

const ALL_PLANS = gql`
  query AllPlansQuery {
    planInfos {
      id
      name
      verboseName
      loadZones
      maxMembers
      maxConcurrentCloudTests
      maxConcurrentScheduledTests
      monthlyCredits
      maxTestDurationMinutes
      dataRetentionMonths
      maxSimulatedUsers
    }
  }
`

const minCurrentPlanCardHeight = 522

export const CurrentPlanCard = () => {
  const workspaceInfo = useWorkspaceInfo()
  const planInfo = usePlanInfo()

  const teamId = useMemo(
    () =>
      workspaceInfo.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo.scope]
  )

  const { data: allPlans } = useQuery<AllPlansQuery>(ALL_PLANS)

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

  return planInfo ? (
    <Card>
      <Stack spacing={2} p={2}>
        <Typography variant="h6" fontWeight="bold">
          Plan
        </Typography>
        <Typography variant="body2">
          Your {teamId ? 'team' : 'account'} is currently on the{' '}
          <PlanChip name={planInfo.name} />
          plan.
        </Typography>
        <Divider />
        <IndividualFeatures nextPlan={nextPlan} />
        <SupportedLoadZones nextPlan={nextPlan} />
        <Divider />
        <Stack spacing={2} direction="row" justifyContent="flex-end">
          {planInfo.priceMonthlyCents > 0 && (
            <Button variant="outlined" color="error">
              Downgrade Plan
            </Button>
          )}
          {nextPlan && (
            <Button variant="contained" color="primary" type="submit">
              Upgrade to {nextPlan.name}
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  ) : (
    <Skeleton height={minCurrentPlanCardHeight} />
  )
}
