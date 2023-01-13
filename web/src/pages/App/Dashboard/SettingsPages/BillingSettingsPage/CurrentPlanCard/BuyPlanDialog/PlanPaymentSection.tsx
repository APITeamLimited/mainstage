import { useEffect, useMemo, useState } from 'react'

import { ROUTES } from '@apiteam/types/src'
import {
  Card,
  Stack,
  Typography,
  useTheme,
  Link,
  Button,
  TextField,
  Skeleton,
} from '@mui/material'
import {
  AcceptQuoteMutation,
  AcceptQuoteMutationVariables,
  AllPlansQuery,
  CreatePlanQuoteMutation,
  CreatePlanQuoteMutationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { prettyPrintCents } from 'src/layouts/Landing/components/pricing'

import { usePaymentMethods } from '../../BillingProvider'
import { PaymentSectionItem } from '../../payment-components/PaymentSectionItem'

const CREATE_PLAN_QUOTE_MUTATION = gql`
  mutation CreatePlanQuoteMutation(
    $planId: String!
    $pricingOption: PricingOption!
    $teamId: String
    $promotionCode: String
  ) {
    createPlanQuote(
      planId: $planId
      pricingOption: $pricingOption
      teamId: $teamId
      promotionCode: $promotionCode
    ) {
      id
      metadata {
        promotionCode
      }
      status
      amount_subtotal
      amount_total
      description
    }
  }
`

const ACCEPT_QUOTE_MUTATION = gql`
  mutation AcceptQuoteMutation($quoteId: String!, $teamId: String) {
    acceptQuote(quoteId: $quoteId, teamId: $teamId) {
      id
    }
  }
`

export type SelectedPlanInfo = {
  planInfo: AllPlansQuery['planInfos'][0]
  pricingOption: 'monthly' | 'yearly'
} | null

type PlanPaymentSectionProps = {
  selectedPlan: SelectedPlanInfo
  trialEligibility: boolean
  onPurchaseComplete: () => void
}

export const PlanPaymentSection = ({
  selectedPlan,
  trialEligibility,
  onPurchaseComplete,
}: PlanPaymentSectionProps) => {
  const theme = useTheme()

  const { fetchedPaymentMethods, customer } = usePaymentMethods()

  const paymentMethod = useMemo(() => {
    if (!customer) {
      return null
    }

    return fetchedPaymentMethods.find(
      (paymentMethod) =>
        paymentMethod.id === customer.invoice_settings?.default_payment_method
    )
  }, [customer, fetchedPaymentMethods])

  const {
    promotionCode,
    setPromotionCode,
    quoteData,
    fetchQuoteError,
    handleAcceptQuote,
  } = useQuote(selectedPlan, onPurchaseComplete)

  const [editValuePromotionCode, setEditValuePromotionCode] =
    useState(promotionCode)

  const billingSchedule = useMemo(() => {
    if (!selectedPlan) {
      return ''
    }

    if (trialEligibility && selectedPlan.planInfo.freeTrialDays) {
      const firstBillingDate = new Date(
        new Date().getTime() +
          selectedPlan.planInfo.freeTrialDays * 1000 * 60 * 60 * 24
      )

      return selectedPlan.pricingOption === 'yearly'
        ? `Yearly from ${firstBillingDate.toLocaleDateString()}`
        : `Monthly from ${firstBillingDate.toLocaleDateString()}`
    }

    return selectedPlan.pricingOption === 'yearly'
      ? `Yearly starting on ${new Date().toLocaleDateString()}`
      : `Monthly starting on ${new Date().toLocaleDateString()}`
  }, [selectedPlan, trialEligibility])

  return selectedPlan && quoteData ? (
    <Stack direction="row" justifyContent="space-evenly" spacing={2}>
      <Card sx={{ p: 2 }} variant="outlined">
        <Stack spacing={2}>
          <Typography variant="h6">Payment Summary</Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            You will be charged $
            {selectedPlan.pricingOption === 'yearly'
              ? prettyPrintCents(selectedPlan.planInfo.priceYearlyCents)
              : prettyPrintCents(selectedPlan.planInfo.priceMonthlyCents)}{' '}
            per {selectedPlan.pricingOption === 'yearly' ? 'year' : 'month'}.
          </Typography>
          <PaymentSectionItem
            title="Plan"
            description={selectedPlan.planInfo.verboseName}
          />
          <PaymentSectionItem
            title="Billing Schedule"
            description={billingSchedule}
          />
          {trialEligibility && (
            <PaymentSectionItem
              title="Trial"
              description={`A free trial of ${selectedPlan.planInfo.freeTrialDays} days will automatically be started`}
            />
          )}
          <PaymentSectionItem
            title="Card"
            description={`**** **** **** ${paymentMethod?.card?.last4}`}
          />
        </Stack>
      </Card>
      <Stack spacing={4} alignItems="flex-start">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            width: '100%',
          }}
        >
          <TextField
            label="Promotion Code"
            value={editValuePromotionCode}
            onChange={(e) => setEditValuePromotionCode(e.target.value)}
            onBlur={() => setPromotionCode(editValuePromotionCode)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setPromotionCode(editValuePromotionCode)}
            sx={{
              height: '100%',
            }}
          >
            Apply
          </Button>
        </Stack>
        {fetchQuoteError && (
          <Typography variant="body2" color="error">
            {fetchQuoteError}
          </Typography>
        )}
        <Stack spacing={2}>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            By clicking Confirm Purchase you agree to our{' '}
            <Link
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => window.open(ROUTES.termsOfService, '_blank')}
            >
              Terms of Service
            </Link>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAcceptQuote}
          >
            Confirm Purchase
          </Button>
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <Skeleton height={300} />
  )
}

const useQuote = (
  selectedPlan: SelectedPlanInfo,
  onPurchaseComplete: () => void
) => {
  const workspaceInfo = useWorkspaceInfo()

  const [promotionCode, setPromotionCode] = useState<string | null>(null)
  const [fetchQuoteError, setFetchQuoteError] = useState<string | null>(null)

  const [quoteData, setQuoteData] = useState<
    CreatePlanQuoteMutation['createPlanQuote'] | null
  >(null)

  const [createPlanQuote] = useMutation<
    CreatePlanQuoteMutation,
    CreatePlanQuoteMutationVariables
  >(CREATE_PLAN_QUOTE_MUTATION, {
    onCompleted: (data) => setQuoteData(data.createPlanQuote),
    onError: (error) => setFetchQuoteError(error.message),
  })

  useEffect(() => {
    if (!selectedPlan) {
      return
    }

    createPlanQuote({
      variables: {
        planId: selectedPlan.planInfo.id,
        pricingOption: selectedPlan.pricingOption,
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
        promotionCode,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPlan,
    promotionCode,
    workspaceInfo.isTeam,
    workspaceInfo.scope.variantTargetId,
  ])

  const [acceptQuote] = useMutation<
    AcceptQuoteMutation,
    AcceptQuoteMutationVariables
  >(ACCEPT_QUOTE_MUTATION, {
    onCompleted: () => onPurchaseComplete(),
    onError: (error) => snackErrorMessageVar(error.message),
  })

  return {
    promotionCode,
    setPromotionCode,
    quoteData,
    fetchQuoteError,
    handleAcceptQuote: () => {
      if (!quoteData) {
        return
      }

      acceptQuote({
        variables: {
          quoteId: quoteData.id,
          teamId: workspaceInfo.isTeam
            ? workspaceInfo.scope.variantTargetId
            : null,
        },
      })
    },
  }
}
