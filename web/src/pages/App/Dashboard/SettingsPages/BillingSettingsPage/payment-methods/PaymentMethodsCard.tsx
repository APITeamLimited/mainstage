import { useEffect, useMemo, useState } from 'react'

import {
  Stack,
  Card,
  Divider,
  Typography,
  Button,
  Box,
  useTheme,
  Skeleton,
  Tooltip,
} from '@mui/material'

import { snackSuccessMessageVar } from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { useQueryParams } from 'src/hooks/use-query-params'

import { usePaymentMethods, useSetupIntents } from '../BillingProvider'
import { useAddressStatus } from '../stripe'

import {
  CardToDeleteDialogStatus,
  PaymentMethodsForm,
} from './PaymentMethodsForm'

const minPaymentMethodCardHeight = 150

export const PaymentMethodsCard = () => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()
  const addressStatus = useAddressStatus()

  useAddCardSuccessMessage()

  const { setupIntentsLoaded } = useSetupIntents()

  const { fetchedPaymentMethods, paymentMethodsLoaded } = usePaymentMethods()

  const [showAddCardDialog, setShowAddCardDialog] = useState(false)

  const [showCardToDelete, setShowCardToDelete] =
    useState<CardToDeleteDialogStatus>({
      show: false,
      paymentMethod: null,
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
          {fetchedPaymentMethods.length > 0 && <Divider />}
          <PaymentMethodsForm
            showAddCardDialog={showAddCardDialog}
            setShowAddCardDialog={setShowAddCardDialog}
            showCardToDelete={showCardToDelete}
            setShowCardToDelete={setShowCardToDelete}
          />
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
      fetchedPaymentMethods.length,
      showAddCardDialog,
      showCardToDelete,
      workspaceInfo.isTeam,
    ]
  )

  if (!(setupIntentsLoaded && paymentMethodsLoaded && addressStatus)) {
    return <Skeleton height={minPaymentMethodCardHeight} />
  }

  return addressStatus === 'PROVIDED' ? (
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
  )
}

const useAddCardSuccessMessage = () => {
  const params = useQueryParams()

  useEffect(() => {
    if (params.get('showAddedCardMessage') === 'true') {
      snackSuccessMessageVar('Card added successfully')
    }
  }, [params])
}
