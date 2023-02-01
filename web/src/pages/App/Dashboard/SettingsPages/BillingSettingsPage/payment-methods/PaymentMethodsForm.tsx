import { useEffect, useState } from 'react'

import CreditCardIcon from '@mui/icons-material/CreditCard'
import {
  Stack,
  Typography,
  Button,
  useTheme,
  TableRow,
  TableCell,
  TableHead,
  Table,
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
import { loadStripe } from '@stripe/stripe-js'
import {
  AddCardMutation,
  AddCardMutationVariables,
  CreateOrUpdateSetupIntentMutation,
  CreateOrUpdateSetupIntentMutationVariables,
  DeleteCardMutation,
  DeleteCardMutationVariables,
  PaymentMethodsQuery,
  SetDefaultPaymentMethodMutation,
  SetDefaultPaymentMethodMutationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { QueryDeleteDialog } from 'src/components/app/dialogs/QueryDeleteDialog'
import { CustomDialog } from 'src/components/custom-mui'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import {
  usePaymentMethods,
  usePublishableKey,
  useSetupIntents,
} from '../BillingProvider'
import { CardElementFrame, getDefaultElementsOptions } from '../stripe'

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
      status
    }
  }
`

const SET_DEFAULT_PAYMENT_METHOD_MUTATION = gql`
  mutation SetDefaultPaymentMethodMutation(
    $teamId: String
    $paymentMethodId: String!
  ) {
    setDefaultPaymentMethod(
      teamId: $teamId
      paymentMethodId: $paymentMethodId
    ) {
      id
      card {
        last4
      }
    }
  }
`

export type CardToDeleteDialogStatus =
  | {
      show: true
      paymentMethod: PaymentMethodsQuery['paymentMethods'][0]
    }
  | {
      show: false
      paymentMethod: PaymentMethodsQuery['paymentMethods'][0] | null
    }

type PaymentMethodsFormProps = {
  showAddCardDialog: boolean
  setShowAddCardDialog: (open: boolean) => void
  showCardToDelete: CardToDeleteDialogStatus
  setShowCardToDelete: (status: CardToDeleteDialogStatus) => void
}

export const PaymentMethodsForm = (props: PaymentMethodsFormProps) => {
  const theme = useTheme()

  const publishableKey = usePublishableKey()

  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey))
    }
  }, [publishableKey])

  return (
    <Elements stripe={stripePromise} options={getDefaultElementsOptions(theme)}>
      <PaymentMethodsFormInner {...props} />
    </Elements>
  )
}

export const PaymentMethodsFormInner = ({
  showAddCardDialog,
  setShowAddCardDialog,
  showCardToDelete,
  setShowCardToDelete,
}: PaymentMethodsFormProps) => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()
  const stripe = useStripe()
  const elements = useElements()

  const [isSubmittingCard, setIsSubmittingCard] = useState(false)

  const { fetchedSetupIntents, refetchSetupIntents } = useSetupIntents()

  const { fetchedPaymentMethods, customer, refetchPaymentMethods } =
    usePaymentMethods()

  const [addCardError, setAddCardError] = useState<string | null>(null)

  const [addCard] = useMutation<AddCardMutation, AddCardMutationVariables>(
    ADD_CARD_MUTATION,
    {
      onCompleted: (data) => {
        setAddCardError(null)

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

        setAddCardError(error.message)
      },
    }
  )

  const handleSubmitNewCard = async () => {
    setIsSubmittingCard(true)
    setAddCardError(null)

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
    onCompleted: async ({ createOrUpdateSetupIntent }) => {
      refetchSetupIntents()

      if (createOrUpdateSetupIntent.status === 'succeeded') {
        snackSuccessMessageVar('Card added successfully')
      } else if (createOrUpdateSetupIntent.status === 'requires_action') {
        // Follow verification flow
        const clientSecret = createOrUpdateSetupIntent.client_secret

        // TODO: Handle redirectUri
        if (!clientSecret || !stripe) {
          snackErrorMessageVar('Failed to verify card')
          return
        }

        const confirmResult = await stripe.confirmCardSetup(clientSecret)

        if (confirmResult.error) {
          snackErrorMessageVar(confirmResult.error.message)
          return
        }

        snackSuccessMessageVar('Card added successfully')
        refetchSetupIntents()
      }
    },
  })

  const [setDefaultPaymentMethod] = useMutation<
    SetDefaultPaymentMethodMutation,
    SetDefaultPaymentMethodMutationVariables
  >(SET_DEFAULT_PAYMENT_METHOD_MUTATION, {
    onCompleted: (data) => {
      snackSuccessMessageVar(
        `Default card set to ${data.setDefaultPaymentMethod?.card?.last4}`
      )
      refetchPaymentMethods()
      refetchSetupIntents()
    },
    onError: (error) => {
      snackErrorMessageVar(`Failed to set default card: ${error.message}`)
    },
  })

  const handleDeleteCard = useDeleteCard(
    refetchSetupIntents,
    refetchPaymentMethods
  )

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
        {addCardError && (
          <Typography variant="body1" color="error">
            {addCardError}
          </Typography>
        )}
      </CustomDialog>
      {fetchedPaymentMethods.length > 0 && (
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
                    {customer?.invoice_settings?.default_payment_method ===
                    paymentMethod.id
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
                    {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
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
                    {customer?.invoice_settings?.default_payment_method !==
                      paymentMethod.id && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          setDefaultPaymentMethod({
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
      )}
    </>
  )
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
