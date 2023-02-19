import { useEffect, useRef, useState } from 'react'

import { ROUTES } from '@apiteam/types'
import {
  Stack,
  Typography,
  useTheme,
  Card,
  Skeleton,
  Button,
  TextField,
  Link,
} from '@mui/material'
import {
  AcceptQuoteMutation,
  AcceptQuoteMutationVariables,
  CreateCreditsQuoteMutation,
  CreateCreditsQuoteMutationVariables,
  CreditsPricingOptionsQuery,
  InvoicePaidQuery,
  InvoicePaidQueryVariables,
} from 'types/graphql'

import { useMutation, useQuery } from '@redwoodjs/web'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import {
  ACCEPT_QUOTE_MUTATION,
  INVOICE_PAID_QUERY,
  useDefaultPaymentMethod,
} from '../../CurrentPlanCard/BuyPlanDialog/PlanPaymentSection'
import { prettyPrintCents } from '../../CurrentPlanCard/IndividualFeatures'
import { PaymentSectionItem } from '../../payment-components/PaymentSectionItem'

const CREATE_CREDITS_QUOTE_MUTATION = gql`
  mutation CreateCreditsQuoteMutation(
    $creditsPricingOptionId: String!
    $teamId: String
    $promotionCode: String
    $quantity: Int!
  ) {
    createCreditsPricingQuote(
      creditsPricingOptionId: $creditsPricingOptionId
      teamId: $teamId
      promotionCode: $promotionCode
      quantity: $quantity
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

type CreditsPaymentSectionProps = {
  creditsPricingOption: CreditsPricingOptionsQuery['creditsPricingOptions'][0]
  onPurchaseComplete: (paymentLink: string | null) => void
}

export const CreditsPaymentSection = ({
  creditsPricingOption,
  onPurchaseComplete,
}: CreditsPaymentSectionProps) => {
  const theme = useTheme()
  const paymentMethod = useDefaultPaymentMethod()

  const {
    promotionCode,
    setPromotionCode,
    quantity,
    setQuantity,
    quoteData,
    currentlyAccepting,
    fetchQuoteError,
    gettingNewQuote,
    handleAcceptQuote,
  } = useQuote(creditsPricingOption, onPurchaseComplete)

  const [editValuePromotionCode, setEditValuePromotionCode] =
    useState(promotionCode)
  const [editValueQuantity, setEditValueQuantity] = useState(quantity)

  return quoteData && paymentMethod?.card && !gettingNewQuote ? (
    <Stack direction="row" justifyContent="space-evenly" spacing={2}>
      <Card sx={{ p: 2 }} variant="outlined">
        <Stack spacing={2}>
          <Typography variant="h6">Payment Summary</Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {quoteData.description}
          </Typography>
          <PaymentSectionItem
            title="Quantity"
            description={quantity.toString()}
          />
          <PaymentSectionItem
            title="Subtotal"
            description={`$${prettyPrintCents(quoteData.amount_subtotal)}`}
          />
          <PaymentSectionItem
            title="Total (Including Tax)"
            description={`$${prettyPrintCents(quoteData.amount_total)}`}
          />
        </Stack>
      </Card>
      <Stack spacing={4} alignItems="flex-start" justifyContent="space-between">
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              width: '100%',
            }}
          >
            <TextField
              label="Quantity"
              value={editValueQuantity}
              onChange={(e) => {
                // Check if the value is an integer
                if (e.target.value.match(/^[0-9]*$/)) {
                  setEditValueQuantity(parseInt(e.target.value))
                } else {
                  snackErrorMessageVar('Quantity must be an integer')
                }
              }}
              onBlur={() => setQuantity(editValueQuantity)}
              size="small"
              fullWidth
              type="number"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setQuantity(editValueQuantity)}
              sx={{
                height: '100%',
              }}
            >
              Update
            </Button>
          </Stack>
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
              value={editValuePromotionCode ?? null}
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
            disabled={currentlyAccepting}
          >
            Confirm Purchase
          </Button>
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <Skeleton height={200} />
  )
}

const useQuote = (
  creditsPricingOption: CreditsPricingOptionsQuery['creditsPricingOptions'][0],
  onPurchaseComplete: (paymentLink: string | null) => void
) => {
  const workspaceInfo = useWorkspaceInfo()

  const [promotionCode, setPromotionCode] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  const [fetchQuoteError, setFetchQuoteError] = useState<string | null>(null)

  const [quoteData, setQuoteData] = useState<
    CreateCreditsQuoteMutation['createCreditsPricingQuote'] | null
  >(null)

  const [createCreditsQuote, { loading: gettingNewQuote }] = useMutation<
    CreateCreditsQuoteMutation,
    CreateCreditsQuoteMutationVariables
  >(CREATE_CREDITS_QUOTE_MUTATION, {
    onCompleted: (data) => {
      setQuoteData(data.createCreditsPricingQuote)
      setFetchQuoteError(null)
    },
    onError: (error) => setFetchQuoteError(error.message),
  })

  useEffect(() => {
    createCreditsQuote({
      variables: {
        creditsPricingOptionId: creditsPricingOption.id,
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
        promotionCode,
        quantity,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    creditsPricingOption,
    promotionCode,
    quantity,
    workspaceInfo.isTeam,
    workspaceInfo.scope.variantTargetId,
  ])

  const pollInvoiceDataRef = useRef<{
    uri: string
    invoiceId: string
  } | null>(null)

  useEffect(() => {
    pollInvoiceDataRef.current = null
  }, [creditsPricingOption])

  const [acceptQuote, { loading: currentlyAccepting }] = useMutation<
    AcceptQuoteMutation,
    AcceptQuoteMutationVariables
  >(ACCEPT_QUOTE_MUTATION, {
    onCompleted: ({ acceptQuote: { invoice } }) => {
      if (invoice.status === 'paid') {
        onPurchaseComplete(null)
      }

      if (invoice.status !== 'open') {
        snackErrorMessageVar('Something went wrong. Please try again later.')
        return
      }

      if (!invoice.hosted_invoice_url) {
        snackErrorMessageVar('Something went wrong. Please try again later.')
        return
      }

      pollInvoiceDataRef.current = {
        uri: invoice.hosted_invoice_url,
        invoiceId: invoice.id,
      }

      onPurchaseComplete(invoice.hosted_invoice_url)
    },
    onError: (error) => snackErrorMessageVar(error.message),
  })

  const { refetch: fetchInvoice } = useQuery<
    InvoicePaidQuery,
    InvoicePaidQueryVariables
  >(INVOICE_PAID_QUERY, {
    skip: !pollInvoiceDataRef.current,
  })

  const [pollInterval, setPollInterval] = useState<NodeJS.Timer | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!pollInvoiceDataRef.current) {
        return
      }

      const { data: invoiceQuery } = await fetchInvoice({
        invoiceId: pollInvoiceDataRef.current.invoiceId,
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
      })

      if (!invoiceQuery.invoice) return
      if (invoiceQuery.invoice.status === 'paid') {
        onPurchaseComplete(null)
        pollInvoiceDataRef.current = null
      }
    }, 2000)

    if (pollInterval) {
      clearInterval(pollInterval)
    }
    setPollInterval(interval)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    gettingNewQuote,
    promotionCode,
    setPromotionCode,
    quantity,
    setQuantity,
    quoteData,
    fetchQuoteError,
    currentlyAccepting,
    handleAcceptQuote: () => {
      if (!quoteData) return

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
