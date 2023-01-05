import { useMemo } from 'react'

import { Card, Skeleton, Stack, Typography } from '@mui/material'
import {
  CurrentPlanInfoQuery,
  CurrentPlanInfoQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { CustomChip } from 'src/components/custom-mui/CustomChip'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const CURRENT_PLAN_INFO = gql`
  query CurrentPlanInfoQuery($teamId: String) {
    currentPlan(teamId: $teamId) {
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
    }
  }
`

const minCurrentPlanCardHeight = 250

export const CurrentPlanCard = () => {
  const workspaceInfo = useWorkspaceInfo()

  const teamId = useMemo(
    () =>
      workspaceInfo.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo.scope]
  )

  const { data: currentPlanInfo } = useQuery<
    CurrentPlanInfoQuery,
    CurrentPlanInfoQueryVariables
  >(CURRENT_PLAN_INFO, {
    variables: { teamId },
  })

  return currentPlanInfo ? (
    <Card>
      <Stack spacing={2} p={2}>
        <Typography variant="h6" fontWeight="bold">
          Plan
        </Typography>
        <Typography variant="body2">
          Your {teamId ? 'team' : 'account'} is currently on the{' '}
          <CustomChip
            label={currentPlanInfo.currentPlan.name}
            size="small"
            variant="outlined"
          />
          plan.
        </Typography>
      </Stack>
    </Card>
  ) : (
    <Skeleton height={minCurrentPlanCardHeight} />
  )
}
