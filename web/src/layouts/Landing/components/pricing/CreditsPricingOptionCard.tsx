import { useMemo } from 'react'

import {
  AbstractCreditsPricingOptionCreateInput,
  DEFAULT_CREDITS_PRICING_OPTION,
} from '@apiteam/types/src'
import { useTheme, Typography, Card, Stack } from '@mui/material'
import {
  CreditsPricingOptionsQuery,
  CreditsPricingOptionsQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { mediumPanelSpacing } from '../constants'

import { numberFormatter, prettyPrintCents } from '.'

const CREDITS_PRICING_OPTIONS_QUERY = gql`
  query CreditsPricingOptionsQuery {
    creditsPricingOptions {
      id
      createdAt
      updatedAt
      name
      verboseName
      credits
      priceCents
    }
  }
`

export const CreditsPricingOptionCard = () => {
  const theme = useTheme()

  const { data } = useQuery<
    CreditsPricingOptionsQuery,
    CreditsPricingOptionsQueryVariables
  >(CREDITS_PRICING_OPTIONS_QUERY, {
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-only', // Used for subsequent executions
  })

  const creditsPricingOption = useMemo(() => formatCreditsPricing(data), [data])

  return (
    <Card
      variant="outlined"
      sx={{
        padding: 4,
      }}
    >
      <Stack spacing={mediumPanelSpacing}>
        <Typography variant="h3" fontWeight="bold">
          {creditsPricingOption.name}
        </Typography>
        <Typography color={theme.palette.text.secondary}>
          {numberFormatter.format(creditsPricingOption.credits)} credits that
          never expire in case you need to run more tests than your plan allows
        </Typography>
        <Stack spacing={1} direction="row" alignItems="baseline">
          <Typography color={theme.palette.text.secondary}>$</Typography>
          <Typography variant="h3" fontWeight={700}>
            {prettyPrintCents(creditsPricingOption.priceCents)}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  )
}

const formatCreditsPricing = (
  data: CreditsPricingOptionsQuery | undefined
): AbstractCreditsPricingOptionCreateInput => {
  if (!data || data.creditsPricingOptions.length === 0) {
    return DEFAULT_CREDITS_PRICING_OPTION
  }

  return {
    name: data.creditsPricingOptions[0].name,
    verboseName: data.creditsPricingOptions[0].verboseName,
    priceCents: data.creditsPricingOptions[0].priceCents,
    credits: data.creditsPricingOptions[0].credits,
  }
}
