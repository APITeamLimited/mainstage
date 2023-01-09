import {
  AbstractPlanInfoCreateInput,
  DEFAULT_PRICING_PLANS,
  ROUTES,
} from '@apiteam/types/src'
import { Typography, Card, Stack, useTheme, Grid, Box } from '@mui/material'
import { PlanInfosQuery } from 'types/graphql'

import { displayCorrectCredits } from 'src/utils/display-correct-credits'

import { mediumPanelSpacing } from '../constants'
import { SignUpOrContinueButton } from '../SignUpOrContinueButton'
import { SignUpThenBuyButton } from '../SignUpThenBuyButton'

import { PlanInfoRow } from './PlanInfoRow'

import { numberFormatter, prettyPrintCents } from '.'

type PricingCardProps = {
  planInfo: AbstractPlanInfoCreateInput
  pricingOption: 'monthly' | 'annual'
  alreadyHadTrial?: boolean
}

export const PricingCard = ({
  planInfo,
  pricingOption,
  alreadyHadTrial,
}: PricingCardProps) => {
  const theme = useTheme()

  const isPaid =
    (pricingOption === 'annual'
      ? planInfo.priceYearlyCents
      : planInfo.priceMonthlyCents) > 0

  const trialEnabled = planInfo.freeTrialDays && !alreadyHadTrial

  return (
    <Grid item xs={12} md={4}>
      {trialEnabled ? (
        <Box
          sx={{
            backgroundColor: theme.palette.success.light,
            paddingX: 4,
            paddingY: 1,
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
          }}
        >
          <Typography typography="h6" fontWeight="bold">
            14 day free trial
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: '36px',
          }}
        />
      )}
      <Card
        variant="outlined"
        sx={{
          padding: 4,
          borderTopLeftRadius: isPaid ? 0 : theme.shape.borderRadius,
          borderTopRightRadius: isPaid ? 0 : theme.shape.borderRadius,

          height: `calc(100% - ${theme.spacing(16)})`,
          borderColor: trialEnabled ? theme.palette.success.light : undefined,
        }}
      >
        <Stack spacing={mediumPanelSpacing}>
          <Typography variant="h3" fontWeight="bold">
            {planInfo.name}
          </Typography>
          {planInfo.description && (
            <Typography color={theme.palette.text.secondary}>
              {planInfo.description}
            </Typography>
          )}
          <Stack spacing={1} direction="row" alignItems="baseline">
            {isPaid && (
              <Typography color={theme.palette.text.secondary}>$</Typography>
            )}
            <Typography variant="h3" fontWeight={700}>
              {!isPaid
                ? 'Free'
                : pricingOption === 'annual'
                ? prettyPrintCents(planInfo.priceYearlyCents)
                : prettyPrintCents(planInfo.priceMonthlyCents)}
            </Typography>
            {isPaid && (
              <Typography color={theme.palette.text.secondary}>
                {pricingOption === 'annual' ? '/yr' : '/mo'}
              </Typography>
            )}
          </Stack>
          {isPaid ? (
            <SignUpThenBuyButton
              size="medium"
              fullWidth
              buyRoute={ROUTES.settingsWorkspaceBilling}
            />
          ) : (
            <SignUpOrContinueButton size="medium" fullWidth />
          )}
          <Typography variant="h6" fontWeight="bold">
            Features
          </Typography>
          <Stack spacing={2}>
            <PlanInfoRow
              text={`${
                planInfo.maxMembers === -1 ? 'Unlimited' : planInfo.maxMembers
              } team members`}
            />
            <PlanInfoRow
              text={`${numberFormatter.format(
                planInfo.maxSimulatedUsers
              )} max simulated users`}
            />
            <PlanInfoRow
              text={`${numberFormatter.format(
                displayCorrectCredits(planInfo.monthlyCredits)
              )} complimentary credits per month`}
            />
            <PlanInfoRow
              text={`${planInfo.maxConcurrentCloudTests} concurrent cloud tests`}
            />
            <PlanInfoRow text={`${planInfo.loadZones.length} load zones`} />
            <PlanInfoRow
              text={`${planInfo.maxTestDurationMinutes} minutes maximum test duration`}
            />
            <PlanInfoRow
              text={`${planInfo.dataRetentionMonths} month${
                planInfo.dataRetentionMonths > 0 ? 's' : ''
              } data retention`}
            />
            <PlanInfoRow
              text={
                planInfo.maxConcurrentScheduledTests
                  ? `${planInfo.maxConcurrentScheduledTests} concurrent scheduled tests`
                  : 'No test scheduling'
              }
              icon={planInfo.maxConcurrentScheduledTests > 0 ? 'tick' : 'cross'}
            />
          </Stack>
        </Stack>
      </Card>
    </Grid>
  )
}

/**
 * Returns live pricing options from the pricing query, or the default pricing options if the query hasn't loaded yet
 */
export const formatPlanInfo = (
  planInfoData: PlanInfosQuery | undefined
): AbstractPlanInfoCreateInput[] => {
  if (!planInfoData) {
    return DEFAULT_PRICING_PLANS.sort(
      (a, b) => a.priceMonthlyCents - b.priceMonthlyCents
    )
  }

  return planInfoData.planInfos
    .map((planInfo) => ({
      name: planInfo.name,
      verboseName: planInfo.verboseName,
      description: planInfo.description,
      priceMonthlyCents: planInfo.priceMonthlyCents,
      priceYearlyCents: planInfo.priceYearlyCents,
      maxMembers: planInfo.maxMembers,
      maxSimulatedUsers: planInfo.maxSimulatedUsers,
      monthlyCredits: planInfo.monthlyCredits,
      maxConcurrentCloudTests: planInfo.maxConcurrentCloudTests,
      maxConcurrentScheduledTests: planInfo.maxConcurrentScheduledTests,
      maxTestDurationMinutes: planInfo.maxTestDurationMinutes,
      dataRetentionMonths: planInfo.dataRetentionMonths,
      freeTrialDays: planInfo.freeTrialDays,
      loadZones: planInfo.loadZones,
    }))
    .sort((a, b) => a.priceMonthlyCents - b.priceMonthlyCents)
}
