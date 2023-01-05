import { useEffect, useMemo, useState } from 'react'

import { ROUTES } from '@apiteam/types/src'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import {
  Stack,
  Card,
  Divider,
  Typography,
  Button,
  Box,
  useTheme,
  Skeleton,
  TableRow,
  TableCell,
  TableHead,
  Table,
  Tooltip,
  TableBody,
  Chip,
} from '@mui/material'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe, SetupIntent } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import {
  AddCardMutation,
  AddCardMutationVariables,
  PaymentMethodsQuery,
  PaymentMethodsQueryVariables,
  SetupIntentsQuery,
  SetupIntentsQueryVariables,
  DeleteCardMutation,
  DeleteCardMutationVariables,
  CreateOrUpdateSetupIntentMutation,
  CreateOrUpdateSetupIntentMutationVariables,
} from 'types/graphql'

import { useMutation, useQuery } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { QueryDeleteDialog } from 'src/components/app/dialogs/QueryDeleteDialog'
import { CustomDialog } from 'src/components/custom-mui'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { useQueryParams } from 'src/hooks/use-query-params'

import { useBillingAddress } from './BillingAddressProvider'
import { STRIPE_PUBLISHABLE_KEY } from './BillingSettingsPage'
import { getDefaultElementsOptions } from './payment-components'
import { CardElementFrame } from './payment-components/CardFrame'

const SETUP_INTENTS_QUERY = gql`
  query SetupIntentsQuery($teamId: String) {
    setupIntents(teamId: $teamId) {
      id
      client_secret
      redirect_uri
      status
    }
  }
`

const PAYMENT_METHODS_QUERY = gql`
  query PaymentMethodsQuery($teamId: String) {
    paymentMethods(teamId: $teamId) {
      id
      card {
        brand
        country
        exp_month
        exp_year
        last4
      }
    }
    customer(teamId: $teamId) {
      id
      invoice_settings {
        default_payment_method
      }
    }
  }
`

const ADD_CARD_MUTATION = gql`
  mutation AddCardMutation(
    $teamId: String
    $tokenId: String!
    $type: StripePaymentMethodTypeEnum!
  ) {
    createPaymentMethod(teamId: $teamId, tokenId: $tokenId, type: $type) {
      id
      card {
        last4
      }
    }
  }
`

const DELETE_CARD_MUTATION = gql`
  mutation DeleteCardMutation($teamId: String, $paymentMethodId: String!) {
    deletePaymentMethod(teamId: $teamId, paymentMethodId: $paymentMethodId) {
      id
      card {
        last4
      }
    }
  }
`

const CREATE_OR_UPDATE_SETUP_INTENT_MUTATION = gql`
  mutation CreateOrUpdateSetupIntentMutation(
    $teamId: String
    $paymentMethodId: String!
  ) {
    createOrUpdateSetupIntent(
      teamId: $teamId
      paymentMethodId: $paymentMethodId
    ) {
      id
      client_secret
      redirect_uri
      status
    }
  }
`

const minPaymentMethodCardHeight = 150

export const PaymentMethodCard = () => {
  const theme = useTheme()

  const stripe = loadStripe(STRIPE_PUBLISHABLE_KEY)

  return (
    <Elements stripe={stripe} options={getDefaultElementsOptions(theme)}>
      <PaymentMethodCardInner />
    </Elements>
  )
}

const PaymentMethodCardInner = () => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()

  const stripe = useStripe()
  const elements = useElements()

  const addressStatus = useAddressStatus()

  useAddCardSuccessMessage()

  const [showAddCardDialog, setShowAddCardDialog] = useState(false)
  const [showCardToDelete, setShowCardToDelete] = useState<
    | {
        show: true
        paymentMethod: PaymentMethodsQuery['paymentMethods'][0]
      }
    | {
        show: false
        paymentMethod: PaymentMethodsQuery['paymentMethods'][0] | null
      }
  >({
    show: false,
    paymentMethod: null,
  })

  const [fetchSetupIntentsError, setFetchSetupIntentsError] =
    useState<Error | null>(null)
  const [fetchedPaymentMethodsError, setFetchedPaymentMethodsError] =
    useState<Error | null>(null)

  const { fetchedSetupIntents, setupIntentsLoaded, refetchSetupIntents } =
    useSetupIntents(stripe, setFetchSetupIntentsError)

  const {
    fetchedPaymentMethods,
    paymentMethodsLoaded,
    customer,
    refetchPaymentMethods,
  } = usePaymentMethods(setFetchedPaymentMethodsError)

  const [addCard] = useMutation<AddCardMutation, AddCardMutationVariables>(
    ADD_CARD_MUTATION,
    {
      onCompleted: (data) => {
        setShowAddCardDialog(false)
        refetchSetupIntents()
        refetchPaymentMethods()

        if (!data.createPaymentMethod) {
          snackErrorMessageVar('Failed to add card to workspace')
          return
        }

        createOrUpdateSetupIntent({
          variables: {
            teamId: workspaceInfo.isTeam
              ? workspaceInfo.scope.variantTargetId
              : null,
            paymentMethodId: data.createPaymentMethod.id,
          },
        })

        setIsSubmittingCard(false)
      },
      onError: (error) => {
        setIsSubmittingCard(false)
        snackErrorMessageVar(error.message)
      },
    }
  )
  const [isSubmittingCard, setIsSubmittingCard] = useState(false)

  const handleDeleteCard = useDeleteCard(
    refetchSetupIntents,
    refetchPaymentMethods
  )

  const handleSubmitNewCard = async () => {
    setIsSubmittingCard(true)

    if (!stripe || !elements) {
      snackErrorMessageVar('Stripe not loaded yet. Please try again.')
      setIsSubmittingCard(false)
      return
    }

    const cardNumberElement = elements.getElement(CardNumberElement)

    if (!cardNumberElement) {
      snackErrorMessageVar('Card element not found. Please contact support.')
      setIsSubmittingCard(false)
      return
    }

    // Create a token, other elements are automatically included
    const cardNumberToken = await stripe.createToken(cardNumberElement)

    if (cardNumberToken.error) {
      snackErrorMessageVar(cardNumberToken.error.message)
      setIsSubmittingCard(false)
      return
    }

    addCard({
      variables: {
        type: 'card',
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
        tokenId: cardNumberToken.token.id,
      },
    })
  }

  const [createOrUpdateSetupIntent] = useMutation<
    CreateOrUpdateSetupIntentMutation,
    CreateOrUpdateSetupIntentMutationVariables
  >(CREATE_OR_UPDATE_SETUP_INTENT_MUTATION, {
    onError: (error) => {
      snackErrorMessageVar(`Failed to verify card: ${error.message}`)
    },
    onCompleted: ({ createOrUpdateSetupIntent }) => {
      console.log('createOrUpdateSetupIntent', createOrUpdateSetupIntent)

      if (createOrUpdateSetupIntent.status === 'succeeded') {
        snackSuccessMessageVar('Card added successfully')
      } else if (createOrUpdateSetupIntent.status === 'requires_action') {
        // Follow verification flow
        const clientSecret = createOrUpdateSetupIntent.client_secret
        const redirectUri = createOrUpdateSetupIntent.redirect_uri

        // TODO: Handle redirectUri
        if (!redirectUri || !clientSecret || !stripe) {
          snackErrorMessageVar('Failed to verify card')
          return
        }

        stripe.confirmCardSetup(clientSecret, {
          return_url: `${window.location.origin}${ROUTES.settingsWorkspaceBilling}?showAddedCardMessage=true`,
        })
      }
    },
  })

  const inner = useMemo(
    () => (
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Payment Methods
          </Typography>
          <Typography variant="body2">
            {fetchedPaymentMethods.length > 0 ? (
              <>
                You have {fetchedPaymentMethods.length} payment method
                {fetchedPaymentMethods.length > 1 ? 's' : ''} on{' '}
                {workspaceInfo.isTeam ? 'this team' : 'your account'}.
              </>
            ) : (
              <>
                Add a payment method to your{' '}
                {workspaceInfo.isTeam ? 'team' : 'account'} to make purchases.
              </>
            )}
          </Typography>
          {fetchSetupIntentsError && (
            <Typography variant="body2" color="error">
              {fetchSetupIntentsError.message}
            </Typography>
          )}
          {fetchedPaymentMethodsError && (
            <Typography variant="body2" color="error">
              {fetchedPaymentMethodsError.message}
            </Typography>
          )}
          {fetchedPaymentMethods.length > 0 && (
            <>
              <Divider />
              <Table size="small" sx={{ width: '100%' }}>
                <TableHead
                  sx={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      Brand
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      Default
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      Card Number
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      Exp. Date
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                      align="right"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetchedPaymentMethods.map((paymentMethod) => {
                    if (!paymentMethod.card) {
                      return null
                    }

                    // Hide if not loaded yet to prevent flicker
                    const isVerified =
                      fetchedSetupIntents.length > 0
                        ? fetchedSetupIntents.some(
                            (setupIntent) =>
                              setupIntent.payment_method === paymentMethod.id &&
                              setupIntent.status === 'succeeded'
                          )
                        : true

                    return (
                      <TableRow key={paymentMethod.id}>
                        <TableCell
                          sx={{
                            borderColor: theme.palette.divider,
                          }}
                        >
                          <Chip
                            size="small"
                            label={paymentMethod.card.brand?.toLowerCase()}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            borderColor: theme.palette.divider,
                          }}
                        >
                          {customer?.invoice_settings
                            ?.default_payment_method === paymentMethod.id
                            ? 'Yes'
                            : 'No'}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderColor: theme.palette.divider,
                          }}
                        >
                          **** **** **** {paymentMethod.card.last4}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderColor: theme.palette.divider,
                          }}
                        >
                          {paymentMethod.card.exp_month}/
                          {paymentMethod.card.exp_year}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderColor: theme.palette.divider,
                            paddingRight: 0,
                          }}
                          align="right"
                        >
                          {!isVerified && (
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() =>
                                createOrUpdateSetupIntent({
                                  variables: {
                                    teamId: workspaceInfo.isTeam
                                      ? workspaceInfo.scope.variantTargetId
                                      : null,
                                    paymentMethodId: paymentMethod.id,
                                  },
                                })
                              }
                              size="small"
                              sx={{
                                p: 0.5,
                                mr: 1,
                              }}
                            >
                              Verify Card
                            </Button>
                          )}
                          {customer?.invoice_settings
                            ?.default_payment_method !== paymentMethod.id && (
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => {}}
                              size="small"
                              sx={{
                                p: 0.5,
                                mr: 1,
                              }}
                            >
                              Make Default
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              setShowCardToDelete({
                                show: true,
                                paymentMethod,
                              })
                            }
                            size="small"
                            sx={{
                              p: 0.5,
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </>
          )}
          <Divider />
          <Box
            sx={{
              alignSelf: 'flex-end',
            }}
          >
            <Button
              variant="contained"
              onClick={() => setShowAddCardDialog(true)}
            >
              Add Card
            </Button>
          </Box>
        </Stack>
      </Card>
    ),
    [
      createOrUpdateSetupIntent,
      customer?.invoice_settings?.default_payment_method,
      fetchSetupIntentsError,
      fetchedPaymentMethods,
      fetchedPaymentMethodsError,
      fetchedSetupIntents,
      theme.palette.divider,
      workspaceInfo.isTeam,
      workspaceInfo.scope.variantTargetId,
    ]
  )

  if (
    !(setupIntentsLoaded && paymentMethodsLoaded && addressStatus && stripe)
  ) {
    return <Skeleton height={minPaymentMethodCardHeight} />
  }

  return (
    <>
      <QueryDeleteDialog
        show={showCardToDelete.show}
        onClose={() =>
          setShowCardToDelete({
            ...showCardToDelete,
            show: false,
          })
        }
        onDelete={() => {
          if (!showCardToDelete.show) {
            throw new Error('No card to delete')
          }
          handleDeleteCard(showCardToDelete.paymentMethod)
        }}
        title="Delete Card"
        description={
          showCardToDelete.paymentMethod?.card
            ? `Are you sure you want to delete the card ending in ${showCardToDelete.paymentMethod.card.last4}?`
            : 'Are you sure you want to delete this card?'
        }
      />
      <CustomDialog
        title="Add Card"
        open={showAddCardDialog}
        onClose={() => setShowAddCardDialog(false)}
        fullWidth
        maxWidth="sm"
        disableScroll
        shrinkable
        padBody
        dialogActions={
          <>
            <Button
              onClick={() => setShowAddCardDialog(false)}
              variant="contained"
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitNewCard}
              disabled={isSubmittingCard}
            >
              Add Card
            </Button>
          </>
        }
      >
        <Typography variant="body1">
          Add a card to your{' '}
          {workspaceInfo.isTeam ? (
            <>
              team <strong>{workspaceInfo.scope.displayName}</strong>
            </>
          ) : (
            'user account'
          )}
          .
        </Typography>
        <CardElementFrame title="Card Number" icon={CreditCardIcon}>
          <CardNumberElement />
        </CardElementFrame>
        <Stack spacing={2} direction="row" justifyContent="space-between">
          <CardElementFrame title="Expiration Date">
            <CardExpiryElement />
          </CardElementFrame>
          <CardElementFrame title="CVC">
            <CardCvcElement />
          </CardElementFrame>
        </Stack>
      </CustomDialog>
      {addressStatus === 'PROVIDED' ? (
        inner
      ) : (
        // Paint opacity to 0.5 if address is not provided
        <Tooltip title="Please provide a billing address before adding a payment method.">
          <span>
            <Box
              sx={{
                opacity: 0.5,
                borderRadius: theme.shape.borderRadius,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {inner}
            </Box>
          </span>
        </Tooltip>
      )}
    </>
  )
}

const useSetupIntents = (
  stripe: Stripe | null,
  setFetchSetupIntentsError: (error: Error | null) => void
) => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: setupIntentsData, refetch: refetchSetupIntents } = useQuery<
    SetupIntentsQuery,
    SetupIntentsQueryVariables
  >(SETUP_INTENTS_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    onError: (error) => {
      setFetchSetupIntentsError(error)
    },
    onCompleted: () => {
      setFetchSetupIntentsError(null)
    },
  })

  const [fetchedSetupIntents, setFetchedSetupIntents] = useState<SetupIntent[]>(
    []
  )

  useEffect(() => {
    if (!stripe || !setupIntentsData) return

    const setupIntents = setupIntentsData.setupIntents

    if (setupIntents.length === 0) {
      setFetchedSetupIntents([])
    }

    const handleFetchSetupIntents = async (
      setupIntents: SetupIntentsQuery['setupIntents']
    ) => {
      const secrets = setupIntents
        .map((setupIntent) => setupIntent.client_secret)
        .filter((secret) => secret !== null) as string[]

      const setupIntentResults = await Promise.all(
        secrets.map((secret) => stripe.retrieveSetupIntent(secret))
      )

      const fetchedSetupIntents = [] as SetupIntent[]

      setupIntentResults.forEach((setupIntent) => {
        if (setupIntent.error) {
          throw setupIntent.error
        }

        fetchedSetupIntents.push(setupIntent.setupIntent)
      })

      return fetchedSetupIntents
    }

    handleFetchSetupIntents(setupIntents)
      .catch((err) => {
        setFetchSetupIntentsError(err)
        return []
      })
      .then((fetchedSetupIntents) => {
        setFetchSetupIntentsError(null)
        setFetchedSetupIntents(fetchedSetupIntents)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupIntentsData, stripe])

  return {
    fetchedSetupIntents,
    refetchSetupIntents,
    setupIntentsLoaded: !!setupIntentsData,
  }
}

const usePaymentMethods = (
  setFetchPaymentMethodsError: (error: Error | null) => void
) => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: paymentMethodsData, refetch: refetchPaymentMethods } = useQuery<
    PaymentMethodsQuery,
    PaymentMethodsQueryVariables
  >(PAYMENT_METHODS_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    onError: (error) => {
      setFetchPaymentMethodsError(error)
    },
    onCompleted: () => {
      setFetchPaymentMethodsError(null)
    },
  })

  return {
    fetchedPaymentMethods: paymentMethodsData?.paymentMethods ?? [],
    customer: paymentMethodsData?.customer,
    refetchPaymentMethods,
    paymentMethodsLoaded: !!paymentMethodsData,
  }
}

const useAddressStatus = () => {
  const addressInfo = useBillingAddress()

  if (!addressInfo) return null

  if (addressInfo.customerAddress) return 'PROVIDED'

  return 'NOT_PROVIDED'
}

const useDeleteCard = (
  refetchSetupIntents: () => void,
  refetchPaymentMethods: () => void
) => {
  const workspaceInfo = useWorkspaceInfo()

  const [deleteCard] = useMutation<
    DeleteCardMutation,
    DeleteCardMutationVariables
  >(DELETE_CARD_MUTATION, {
    onCompleted: (data) => {
      refetchSetupIntents()
      refetchPaymentMethods()

      const cardId = data.deletePaymentMethod?.card?.last4
      snackSuccessMessageVar(
        cardId
          ? `Successfully deleted card ending in ${cardId}`
          : 'Successfully deleted card'
      )
    },
    onError: (error) => {
      snackErrorMessageVar(error.message)
    },
  })

  return async (paymentMethod: PaymentMethodsQuery['paymentMethods'][0]) => {
    deleteCard({
      variables: {
        paymentMethodId: paymentMethod.id,
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
      },
    })
  }
}

const useAddCardSuccessMessage = () => {
  const params = useQueryParams()

  useEffect(() => {
    if (params.get('showAddedCardMessage') === 'true') {
      snackSuccessMessageVar('Card added successfully')
    }
  }, [params])
}
