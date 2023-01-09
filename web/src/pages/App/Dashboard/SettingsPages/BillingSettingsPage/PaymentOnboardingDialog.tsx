import { useEffect, useMemo, useState } from 'react'

import {
  Button,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'

import { CustomDialog } from 'src/components/custom-mui'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { BillingAddressForm } from './billing-address/BillingAddressForm'
import { useBillingForm } from './billing-address/use-billing-form'
import { usePaymentMethods } from './BillingProvider'
import {
  CardToDeleteDialogStatus,
  PaymentMethodsForm,
} from './payment-methods/PaymentMethodsForm'
import { useAddressStatus, usePaymentStatus } from './stripe'

type FinalStep = {
  stepName: string
  title: string
  section: JSX.Element
  sectionButtons: JSX.Element
}

type PaymentOnboardingDialogProps = {
  title: string
  open: boolean
  onClose: () => void
  finalSteps: FinalStep[]
  activeFinalStep: number
}

const billingStep = {
  index: 0,
  title: 'Billing Address',
}

const paymentMethodStep = {
  index: 1,
  title: 'Payment Method',
}

export const PaymentOnboardingDialog = ({
  title,
  open,
  onClose,
  finalSteps,
  activeFinalStep,
}: PaymentOnboardingDialogProps) => {
  const workspaceInfo = useWorkspaceInfo()
  const { fetchedPaymentMethods } = usePaymentMethods()
  const { formik: billingAddressFormik } = useBillingForm()
  const { step, activeStep, allSteps } = useSteps(finalSteps, activeFinalStep)

  useEffect(() => {
    if (!open) {
      billingAddressFormik.resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [showPaymentAddCardDialog, setShowPaymentAddCardDialog] =
    useState(false)

  const [showPaymentCardToDelete, setShowPaymentCardToDelete] =
    useState<CardToDeleteDialogStatus>({
      show: false,
      paymentMethod: null,
    })

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="md"
      fullWidth
      padBody
      shrinkable
      dialogActions={
        step === 'billingAddress' ? (
          <>
            <Button variant="outlined" onClick={onClose} color="error">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="billing-address-form"
            >
              Save
            </Button>
          </>
        ) : step === 'paymentMethod' ? (
          <>
            <Button variant="outlined" onClick={onClose} color="error">
              Cancel
            </Button>
            {fetchedPaymentMethods.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowPaymentAddCardDialog(true)}
              >
                Add Another Card
              </Button>
            )}
          </>
        ) : (
          finalSteps[activeFinalStep].section
        )
      }
    >
      <Stepper activeStep={activeStep.index} alternativeLabel>
        {allSteps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {step === 'billingAddress' ? (
        <form
          onSubmit={billingAddressFormik.handleSubmit}
          noValidate
          id="billing-address-form"
        >
          <Stack spacing={2}>
            <Typography variant="body2">
              Enter the billing address for your{' '}
              {workspaceInfo.isTeam ? 'team' : 'account'}. This will be used for
              all billing and invoicing. This can be personal or business.
            </Typography>
            <BillingAddressForm formik={billingAddressFormik} />
          </Stack>
        </form>
      ) : step === 'paymentMethod' ? (
        <form noValidate id="payment-method-form">
          <Stack spacing={2}>
            <Typography variant="body2">
              {fetchedPaymentMethods.length > 0 ? (
                <>
                  Please ensure that you have at least one verified payment
                  method on your account
                </>
              ) : (
                <>
                  Add a payment method to your{' '}
                  {workspaceInfo.isTeam ? 'team' : 'account'} before you make a
                  purchase.
                </>
              )}
            </Typography>
            <PaymentMethodsForm
              showAddCardDialog={showPaymentAddCardDialog}
              setShowAddCardDialog={setShowPaymentAddCardDialog}
              showCardToDelete={showPaymentCardToDelete}
              setShowCardToDelete={setShowPaymentCardToDelete}
            />
            {fetchedPaymentMethods.length === 0 && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowPaymentAddCardDialog(true)}
                >
                  Add Card
                </Button>
              </Stack>
            )}
          </Stack>
        </form>
      ) : (
        finalSteps[activeFinalStep].sectionButtons
      )}
    </CustomDialog>
  )
}

const useSteps = (
  finalSteps: PaymentOnboardingDialogProps['finalSteps'],
  activeFinalStep: PaymentOnboardingDialogProps['activeFinalStep']
) => {
  const addressStatus = useAddressStatus()
  const paymentStatus = usePaymentStatus()

  const step = useMemo(() => {
    if (addressStatus !== 'PROVIDED') return 'billingAddress'
    if (paymentStatus !== 'PROVIDED') return 'paymentMethod'

    return 'finished'
  }, [addressStatus, paymentStatus])

  const activeStep = useMemo<{
    index: number
    title: string
  }>(() => {
    if (step === 'billingAddress') return billingStep
    if (step === 'paymentMethod') return paymentMethodStep
    return {
      index: activeFinalStep + 2,
      title: finalSteps[activeFinalStep].title,
    }
  }, [step, finalSteps, activeFinalStep])

  const allSteps = useMemo(
    () => [
      billingStep,
      paymentMethodStep,
      ...finalSteps.map((step, index) => ({
        index: index + 2,
        title: step.title,
      })),
    ],
    [finalSteps]
  )

  return {
    step,
    activeStep,
    allSteps,
  }
}
