import { useState, useMemo } from 'react'

import {
  AbstractPlanInfoCreateInput,
  DEFAULT_PRICING_PLANS,
  ROUTES,
} from '@apiteam/types/src'
import {
  useTheme,
  Typography,
  Card,
  Stack,
  Box,
  Grid,
  Switch,
  Alert,
} from '@mui/material'
import { PlanInfosQuery, PlanInfosQueryVariables } from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { CallToClickLink } from 'src/layouts/Landing/components/CallToClickLink'

import {
  largePanelSpacing,
  mediumPanelSpacing,
  smallPanelSpacing,
} from '../constants'
import { SignUpOrContinueButton } from '../SignUpOrContinueButton'
import { SignUpThenBuyButton } from '../SignUpThenBuyButton'

import { PlanInfoRow } from './PlanInfoRow'

import { CreditsPricingOptionCard, numberFormatter, prettyPrintCents } from '.'

const PLAN_INFOS_QUERY = gql`
  query PlanInfosQuery {
    planInfos {
      id
      createdAt
      updatedAt
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

type PricingOverviewProps = {
  showLinkToPricingPage?: boolean
  showCreditsPricingOption?: boolean
}

export const PricingOverview = ({
  showLinkToPricingPage,
  showCreditsPricingOption,
}: PricingOverviewProps) => {
  const theme = useTheme()

  const { data } = useQuery<PlanInfosQuery, PlanInfosQueryVariables>(
    PLAN_INFOS_QUERY,
    {
      fetchPolicy: 'network-only', // Used for first execution
      nextFetchPolicy: 'cache-only', // Used for subsequent executions
    }
  )

  const [pricingOption, setPricingOption] = useState<'monthly' | 'annual'>(
    'monthly'
  )

  const planInfos = useMemo(() => formatPlanInfo(data), [data])

  return (
    <Stack spacing={largePanelSpacing}>
      <Stack spacing={smallPanelSpacing} alignItems="center">
        <Typography
          variant="h2"
          fontWeight="bold"
          align="center"
          color={theme.palette.text.primary}
        >
          Get the right plan{' '}
          <span
            style={{
              color: theme.palette.primary.main,
            }}
          >
            for your team
          </span>
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color={theme.palette.text.secondary}
          align="center"
        >
          Choose the plan that best fits your needs.
        </Typography>
      </Stack>
      <Stack spacing={smallPanelSpacing} alignItems="center">
        <Stack
          spacing={smallPanelSpacing}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Typography>Monthly</Typography>
          <Switch
            checked={pricingOption === 'annual'}
            onChange={(event) =>
              setPricingOption(event.target.checked ? 'annual' : 'monthly')
            }
            size="medium"
          />
          <Typography>Annual</Typography>
        </Stack>
        <Alert severity="info">Get 2 months free with annual billing</Alert>
      </Stack>
      <Stack spacing={mediumPanelSpacing}>
        <Grid container spacing={mediumPanelSpacing} justifyContent="center">
          {planInfos.map((planInfo, index) => {
            const isPaid =
              (pricingOption === 'annual'
                ? planInfo.priceYearlyCents
                : planInfo.priceMonthlyCents) > 0

            return (
              <Grid item xs={12} md={4} key={index}>
                {planInfo.freeTrialDays ? (
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
                    borderColor: planInfo.freeTrialDays
                      ? theme.palette.success.light
                      : undefined,
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
                          planInfo.maxMembers === -1
                            ? 'Unlimited'
                            : planInfo.maxMembers
                        } team members`}
                      />
                      <PlanInfoRow
                        text={`${numberFormatter.format(
                          planInfo.maxSimulatedUsers
                        )} max simulated users`}
                      />
                      <PlanInfoRow
                        text={`${numberFormatter.format(
                          planInfo.monthlyCredits
                        )} complimentary credits per month`}
                      />
                      <PlanInfoRow
                        text={`${planInfo.maxConcurrentCloudTests} max concurrent cloud tests`}
                      />
                      <PlanInfoRow
                        text={`${planInfo.loadZones.length} load zones`}
                      />
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
                            ? `${planInfo.maxConcurrentScheduledTests} max concurrent scheduled tests`
                            : 'No test scheduling'
                        }
                        icon={
                          planInfo.maxConcurrentScheduledTests > 0
                            ? 'tick'
                            : 'cross'
                        }
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            )
          })}
        </Grid>
        {showCreditsPricingOption && (
          <Grid container spacing={mediumPanelSpacing} justifyContent="center">
            <Grid item xs={12} md={6}>
              <CreditsPricingOptionCard />
            </Grid>
          </Grid>
        )}
      </Stack>
      {showLinkToPricingPage && (
        <Stack spacing={mediumPanelSpacing} alignItems="center">
          <CallToClickLink
            text="Full pricing and add-ons"
            link={ROUTES.plansAndPricing}
          />
        </Stack>
      )}
    </Stack>
  )
}

/**
 * Returns live pricing options from the pricing query, or the default pricing options if the query hasn't loaded yet
 */
const formatPlanInfo = (
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
