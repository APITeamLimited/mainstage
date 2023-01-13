import { Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material'
import { AllPlansQuery } from 'types/graphql'

import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { displayCorrectCredits } from 'src/utils/display-correct-credits'

// Format numbers as K or M
const numberFormatter = Intl.NumberFormat('en-US', {
  notation: 'compact',
})

const minuteFormatter = Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'minute',
  unitDisplay: 'long',
})

const hourFormatter = Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'hour',
  unitDisplay: 'long',
})

export const prettyPrintCents = (cents: number): string => {
  const dollars = cents / 100

  // Round to 2 decimal places and format as currency
  return dollars.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type IndividualFeaturesProps = {
  nextPlan: AllPlansQuery['planInfos'][0] | null
}

export const IndividualFeatures = ({ nextPlan }: IndividualFeaturesProps) => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()
  const planInfo = usePlanInfo()

  return planInfo ? (
    <Grid
      container
      spacing={2}
      style={{
        marginTop: 0,
        marginLeft: theme.spacing(-2),
      }}
    >
      {workspaceInfo.isTeam && planInfo && (
        <Grid item xs={6} sm={4}>
          <Stack spacing={2}>
            <Typography variant="body1" fontWeight="bold">
              Max Members
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Typography variant="body2">
                {planInfo.maxMembers === -1 ? 'Unlimited' : planInfo.maxMembers}
              </Typography>
              {nextPlan &&
                planInfo.maxMembers !== -1 &&
                (nextPlan.maxMembers > planInfo.maxMembers ||
                  nextPlan.maxMembers === -1) && (
                  <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                  >
                    Upgrade to {nextPlan.name} to access{' '}
                    {nextPlan.maxMembers === -1
                      ? 'unlimited'
                      : nextPlan.maxMembers}{' '}
                    team members
                  </Typography>
                )}
            </Stack>
          </Stack>
        </Grid>
      )}
      <Grid item xs={12} sm={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight="bold">
            Monthly Free Credits
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="body2">
              {numberFormatter.format(
                displayCorrectCredits(planInfo.monthlyCredits)
              )}
            </Typography>
            {nextPlan &&
              nextPlan.maxSimulatedUsers > planInfo.maxSimulatedUsers && (
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Upgrade to {nextPlan.name} to access{' '}
                  {numberFormatter.format(
                    displayCorrectCredits(nextPlan.monthlyCredits)
                  )}
                </Typography>
              )}
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight="bold">
            Max Simulated Users
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="body2">
              {numberFormatter.format(planInfo.maxSimulatedUsers)}
            </Typography>
            {nextPlan &&
              nextPlan.maxSimulatedUsers > planInfo.maxSimulatedUsers && (
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Upgrade to {nextPlan.name} to access{' '}
                  {numberFormatter.format(nextPlan.maxSimulatedUsers)}
                </Typography>
              )}
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight="bold">
            Concurrent Cloud Tests
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="body2">
              {planInfo.maxConcurrentCloudTests}
            </Typography>
            {nextPlan &&
              nextPlan.maxConcurrentCloudTests >
                planInfo.maxConcurrentCloudTests && (
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Upgrade to {nextPlan.name} to access{' '}
                  {nextPlan.maxConcurrentCloudTests}
                </Typography>
              )}
          </Stack>
        </Stack>
      </Grid>
      {/* TODO: Re-add when supported */}
      {/* <Grid item xs={12} sm={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight="bold">
            Concurrent Scheduled Tests
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="body2">
              {planInfo.maxConcurrentScheduledTests === 0
                ? 'Disabled'
                : planInfo.maxConcurrentScheduledTests}
            </Typography>
            {nextPlan &&
              nextPlan.maxConcurrentScheduledTests >
                planInfo.maxConcurrentScheduledTests && (
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Upgrade to {nextPlan.name} to access{' '}
                  {nextPlan.maxConcurrentScheduledTests}
                </Typography>
              )}
          </Stack>
        </Stack>
      </Grid> */}
      <Grid item xs={12} sm={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight="bold">
            Max Test Duration
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="body2">
              {planInfo.maxTestDurationMinutes > 60
                ? hourFormatter.format(planInfo.maxTestDurationMinutes / 60)
                : minuteFormatter.format(planInfo.maxTestDurationMinutes)}
            </Typography>
            {nextPlan &&
              nextPlan.maxTestDurationMinutes >
                planInfo.maxTestDurationMinutes && (
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Upgrade to {nextPlan.name} to access{' '}
                  {nextPlan.maxTestDurationMinutes > 60
                    ? hourFormatter.format(nextPlan.maxTestDurationMinutes / 60)
                    : minuteFormatter.format(
                        nextPlan.maxTestDurationMinutes
                      )}{' '}
                  max test duration
                </Typography>
              )}
          </Stack>
        </Stack>
      </Grid>
      {/* TODO: Re-add when supported */}
      {/* <Grid item xs={12} sm={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight="bold">
            Test Data Retention
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Typography variant="body2">
              {planInfo.dataRetentionMonths} month
              {planInfo.dataRetentionMonths > 1 ? 's' : ''}
            </Typography>
            {nextPlan &&
              nextPlan.dataRetentionMonths > planInfo.dataRetentionMonths && (
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Upgrade to {nextPlan.name} to access{' '}
                  {nextPlan.dataRetentionMonths} month
                  {nextPlan.dataRetentionMonths > 1 ? 's' : ''} test data
                  retention
                </Typography>
              )}
          </Stack>
        </Stack>
      </Grid> */}
    </Grid>
  ) : (
    <Skeleton variant="text" height={20} />
  )
}
