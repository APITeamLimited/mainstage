import { useEffect, useState } from 'react'

import { Alert, Button, TextField, Typography } from '@mui/material'
import {
  DowngradePlanMutation,
  DowngradePlanMutationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { CustomDialog } from 'src/components/custom-mui'
import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useSubscription } from '../BillingProvider'

const DOWNGRADE_PLAN_MUTATION = gql`
  mutation DowngradePlanMutation($teamId: String) {
    downgradePlan(teamId: $teamId) {
      id
      cancel_at_period_end
    }
  }
`

type DowngradePlanDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const DowngradePlanDialog = ({
  open,
  setOpen,
}: DowngradePlanDialogProps) => {
  const workspaceInfo = useWorkspaceInfo()

  const planInfo = usePlanInfo()
  const { refetchSubscription, fetchedSubscription } = useSubscription()

  const [downgradePlan, { loading: currentlyDowngrading }] = useMutation<
    DowngradePlanMutation,
    DowngradePlanMutationVariables
  >(DOWNGRADE_PLAN_MUTATION, {
    onCompleted: (data) => {
      if (!data.downgradePlan || !data.downgradePlan.cancel_at_period_end) {
        snackErrorMessageVar(
          'Error!, could not downgrade plan. Please contact support.'
        )
        return
      }

      snackSuccessMessageVar(
        'Success! Your plan will be downgraded at the end of your billing cycle.'
      )

      refetchSubscription()
      setOpen(false)
    },
    onError: (error) => snackErrorMessageVar(error.message),
  })

  const [typedConfirm, setTypedConfirm] = useState('')

  useEffect(() => {
    if (!open) {
      setTypedConfirm('')
    }
  }, [open])

  return (
    <CustomDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Downgrade Plan"
      maxWidth="sm"
      fullWidth
      padBody
      shrinkable
      scrollHeight={800}
      dialogActions={
        <>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOpen(false)}
          >
            I&apos;ve Changed My Mind
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              downgradePlan({
                variables: {
                  teamId: workspaceInfo.isTeam
                    ? workspaceInfo.scope.variantTargetId
                    : null,
                },
              })
            }
            disabled={currentlyDowngrading || typedConfirm !== 'downgrade'}
          >
            Confirm Downgrade
          </Button>
        </>
      }
    >
      {fetchedSubscription && fetchedSubscription.current_period_end ? (
        <>
          <Alert severity="error">
            Are you sure you want to downgrade your plan?
          </Alert>
          <Typography variant="body2">
            You will be able to continue to use the benefits of your current
            plan until the end of your billing cycle. After that, you will be
            downgraded to the free plan. No further charges will be made.
          </Typography>
          <Typography variant="body2">
            After cancellation, you will remain on {planInfo?.verboseName} till{' '}
            <strong>
              {new Date(
                fetchedSubscription.current_period_end * 1000
              ).toLocaleDateString()}
            </strong>
            .
          </Typography>
          <Typography variant="body2">
            To confirm, please type <strong>downgrade</strong> below.
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            label="Type 'downgrade' to confirm"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            size="small"
          />
        </>
      ) : (
        <Typography variant="body2" color="error">
          An error occurred while fetching your billing cycle. Please contact
          support.
        </Typography>
      )}
    </CustomDialog>
  )
}
