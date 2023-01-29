import { useState, useMemo } from 'react'

import {
  AbstractPlanInfoCreateInput,
  DEFAULT_PRICING_PLANS,
  ROUTES,
} from '@apiteam/types/src'
import {
  useTheme,
  Typography,
  Stack,
  Grid,
  Switch,
  Alert,
  Container,
  alpha,
  Box,
} from '@mui/material'
import { PlanInfosQuery, PlanInfosQueryVariables } from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { CallToClickLink } from 'src/layouts/Landing/components/CallToClickLink'

import {
  largePanelSpacing,
  mediumPanelSpacing,
  panelSeparation,
  smallPanelSpacing,
} from '../constants'

import { PricingCard } from './PricingCard'

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
  pricingRef: React.RefObject<HTMLDivElement>
}

export const PricingOverview = ({
  showLinkToPricingPage,
  showCreditsPricingOption,pricingRef
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
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box position="relative" top={-100} ref={pricingRef} />
      <Stack spacing={largePanelSpacing} sx={{ width: '100%' }}>
        <Stack
          spacing={smallPanelSpacing}
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <Typography
            variant="h1"
            fontWeight="bold"
            align="center"
            color={theme.palette.text.primary}
          >
            Get the right plan{' '}
            <span
              style={{
                color: theme.palette.primary.main,
                background: `linear-gradient(180deg, transparent 82%, ${alpha(
                  theme.palette.secondary.main,
                  0.3
                )} 0%)`,
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
        <Stack
          spacing={smallPanelSpacing}
          alignItems="center"
          sx={{
            width: '100%',
          }}
        >
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
        <Stack spacing={mediumPanelSpacing} sx={{ width: '100%' }}>
          <Grid
            container
            spacing={mediumPanelSpacing}
            justifyContent="center"
            alignItems="stretch"
          >
            {planInfos.map((planInfo, index) => (
              <PricingCard
                planInfo={planInfo}
                pricingOption={pricingOption}
                key={index}
              />
            ))}
          </Grid>
          {showCreditsPricingOption && (
            <Grid container justifyContent="center">
              <Grid xs={12} md={6}>
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
    </Container>
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
