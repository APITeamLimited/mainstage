import { AbstractPlanInfoCreateInput, ROUTES } from '@apiteam/types'
import {
  Typography,
  Card,
  Stack,
  useTheme,
  Grid,
  Box,
  GridProps,
  Button,
} from '@mui/material'

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
  mdWidth?: number
  gridStyles?: GridProps['style']
  disableEmptyTrialPadding?: boolean
  splitPricing?: {
    onClickMonthly: () => void
    onClickYearly: () => void
  }
}

export const PricingCard = ({
  planInfo,
  pricingOption,
  alreadyHadTrial,
  mdWidth = 4,
  gridStyles,
  disableEmptyTrialPadding,
  splitPricing,
}: PricingCardProps) => {
  const theme = useTheme()

  const isPaid =
    (pricingOption === 'annual'
      ? planInfo.priceYearlyCents
      : planInfo.priceMonthlyCents) > 0

  const trialEnabled = planInfo.freeTrialDays && !alreadyHadTrial

  return (
    <Grid item xs={12} md={mdWidth} style={gridStyles}>
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
      ) : !disableEmptyTrialPadding ? (
        <Box
          sx={{
            minHeight: '36px',
          }}
        />
      ) : (
        <></>
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
          {splitPricing ? (
            <>
              <Stack spacing={2} direction="row">
                <Button
                  variant="contained"
                  onClick={splitPricing.onClickMonthly}
                  sx={{
                    width: '100%',
                  }}
                >
                  Buy Monthly ${prettyPrintCents(planInfo.priceMonthlyCents)}
                </Button>
                <Button
                  variant="contained"
                  onClick={splitPricing.onClickYearly}
                  sx={{
                    width: '100%',
                  }}
                >
                  Buy Yearly ${prettyPrintCents(planInfo.priceYearlyCents)}
                </Button>
              </Stack>
              <Typography
                color={theme.palette.text.secondary}
                textAlign="center"
              >
                Get 2 months free with annual billing
              </Typography>
            </>
          ) : (
            <>
              <Stack spacing={1} direction="row" alignItems="baseline">
                {isPaid && (
                  <Typography color={theme.palette.text.secondary}>
                    $
                  </Typography>
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
                  params={{
                    showPlans: 'true',
                  }}
                />
              ) : (
                <SignUpOrContinueButton size="medium" fullWidth />
              )}
            </>
          )}
          <Typography variant="h6" fontWeight="bold">
            Features
          </Typography>
          <Stack spacing={2}>
            <PlanInfoRow text="Realtime collaboration with unlimited projects, collections, and requests" />
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
              tooltipText={
                planInfo.name === 'Free'
                  ? 'Enough for approximately 5 hours of load tests with 250 simulated users or 20K individual requests'
                  : 'Enough for approximately 500 hours of load tests with 250 simulated users or 2M individual requests'
              }
            />
            <PlanInfoRow
              text={`${planInfo.maxConcurrentCloudTests} concurrent cloud tests`}
            />
            <PlanInfoRow text={`${planInfo.loadZones.length} load zones`} />
            <PlanInfoRow
              text={`${planInfo.maxTestDurationMinutes} minutes maximum test duration`}
            />
            {/* TODO: re-add when supported */}
            {/* <PlanInfoRow
              text={`${planInfo.dataRetentionMonths} month${
                planInfo.dataRetentionMonths > 0 ? 's' : ''
              } data retention`}
            /> */}
            {/* TODO: re-add when supported */}
            {/* <PlanInfoRow
              text={
                planInfo.maxConcurrentScheduledTests
                  ? `${planInfo.maxConcurrentScheduledTests} concurrent scheduled tests`
                  : 'No test scheduling'
              }
              icon={planInfo.maxConcurrentScheduledTests > 0 ? 'tick' : 'cross'}
            /> */}
          </Stack>
        </Stack>
      </Card>
    </Grid>
  )
}
