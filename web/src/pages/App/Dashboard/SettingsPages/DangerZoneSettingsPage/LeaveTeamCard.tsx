import { useState } from 'react'

import { Workspace } from '@apiteam/types/src'
import {
  Stack,
  Card,
  Divider,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import { LeaveTeamMutation, LeaveTeamMutationVariables } from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'

const LEAVE_TEAM_MUTATION = gql`
  mutation LeaveTeamMutation($teamId: String!) {
    leaveTeam(teamId: $teamId)
  }
`

type LeaveTeamCardProps = {
  workspaceInfo: Workspace
}

export const LeaveTeamCard = ({ workspaceInfo }: LeaveTeamCardProps) => {
  const [leaveTeam] = useMutation<
    LeaveTeamMutation,
    LeaveTeamMutationVariables
  >(LEAVE_TEAM_MUTATION, {
    onCompleted: () => {
      setShowDialog(false)
      snackSuccessMessageVar(
        'Successfuly left the team. You will be redirected to the home page in a few seconds'
      )
    },
    onError: (error) =>
      snackErrorMessageVar(`Error leaving team: ${error.message}`),
  })

  const [showDialog, setShowDialog] = useState(false)

  const handleLeaveTeam = () =>
    leaveTeam({
      variables: {
        teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
      },
    })

  return (
    <>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Leave Team
          </Typography>
          <Typography variant="body2">
            Leave the team {workspaceInfo.scope.displayName}
          </Typography>
          <Divider />
          <Box
            sx={{
              alignSelf: 'flex-end',
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => setShowDialog(true)}
            >
              Leave Team
            </Button>
          </Box>
        </Stack>
      </Card>
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Leave Team</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Are you sure you want to leave the team{' '}
              {workspaceInfo.scope.displayName} ?
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button color="error" type="submit" onClick={handleLeaveTeam}>
            Leave Team
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
