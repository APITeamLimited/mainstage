import {
  Card,
  Divider,
  Typography,
  useTheme,
  Button,
  Box,
  Stack,
} from '@mui/material'
import type {
  CancelDowngradeMutation,
  CancelDowngradeMutationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useSubscription } from './BillingProvider'

const CANCEL_DOWNGRADE_MUTATION = gql`
  mutation CancelDowngradeMutation($teamId: String) {
    cancelDowngradePlan(teamId: $teamId) {
      id
      cancel_at_period_end
    }
  }
`

export const MarkedForCancellationCard = () => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()
  const { fetchedSubscription, refetchSubscription } = useSubscription()

  const [cancelDowngrade] = useMutation<
    CancelDowngradeMutation,
    CancelDowngradeMutationVariables
  >(CANCEL_DOWNGRADE_MUTATION, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    onCompleted: (data) => {
      if (!data.cancelDowngradePlan) {
        snackErrorMessageVar(
          'Error, could not cancel downgrade. Please contact support.'
        )
        return
      }

      if (!data.cancelDowngradePlan.cancel_at_period_end === false) {
        snackErrorMessageVar(
          'Error, could not cancel downgrade. Please contact support.'
        )
        return
      }

      snackSuccessMessageVar(
        "Success! Your plan's cancellation has been revoked."
      )
      refetchSubscription()
    },
    onError: (error) => snackErrorMessageVar(error.message),
  })

  if (
    !fetchedSubscription ||
    !fetchedSubscription.cancel_at_period_end ||
    !fetchedSubscription.current_period_end
  ) {
    return <></>
  }

  return (
    <Card sx={{ backgroundColor: theme.palette.error.light }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          color={theme.palette.background.paper}
        >
          Plan Cancellation
        </Typography>
        <Typography variant="body2" color={theme.palette.background.paper}>
          Your {workspaceInfo.isTeam ? 'team' : 'account'} will be downgraded to
          the free plan on{' '}
          {new Date(
            fetchedSubscription.current_period_end * 1000
          ).toLocaleDateString()}
          .
        </Typography>
        <Divider color={theme.palette.background.paper} />
        <Box
          sx={{
            alignSelf: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            color="error"
            sx={{
              borderColor: theme.palette.background.paper,
              color: theme.palette.background.paper,
              '&:hover': {
                borderColor: theme.palette.background.paper,
                color: theme.palette.background.paper,
              },
            }}
            onClick={() =>
              cancelDowngrade({
                variables: {
                  teamId: workspaceInfo.isTeam
                    ? workspaceInfo.scope.variantTargetId
                    : null,
                },
              })
            }
          >
            Revoke Cancellation
          </Button>
        </Box>
      </Stack>
    </Card>
  )
}
