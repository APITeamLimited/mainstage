import { useState, useMemo } from 'react'

import { ROUTES } from '@apiteam/types/src'
import { useTheme, Typography, Stack, Grid, Switch, Alert } from '@mui/material'
import { PlanInfosQuery, PlanInfosQueryVariables } from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { CallToClickLink } from 'src/layouts/Landing/components/CallToClickLink'

import {
  largePanelSpacing,
  mediumPanelSpacing,
  smallPanelSpacing,
} from '../constants'

import { formatPlanInfo, PricingCard } from './PricingCard'

import { CreditsPricingOptionCard } from '.'

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
          {planInfos.map((planInfo, index) => (
            <PricingCard
              planInfo={planInfo}
              pricingOption={pricingOption}
              key={index}
            />
          ))}
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
