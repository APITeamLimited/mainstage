import { useEffect } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  ListPendingInvitations,
  UpdateInvitation,
  DeleteInvitation,
  DeleteInvitationVariables,
  UpdateInvitationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

type ManageInvitationRowProps = {
  invitation: ListPendingInvitations['invitations'][0]
  teamId: string
  refetch: () => void
  setSnackSuccessMessage: (message: string | null) => void
  setSnackErrorMessage: (message: string | null) => void
}

const CANCEL_INVITATION_MUTATION = gql`
  mutation DeleteInvitation($teamId: String!, $email: String!) {
    deleteInvitation(teamId: $teamId, email: $email) {
      id
      email
    }
  }
`

const UPDATE_INVITATION_MUTATION = gql`
  mutation UpdateInvitation(
    $teamId: String!
    $invitations: [InvitationInput!]!
  ) {
    updateInvitations(teamId: $teamId, invitations: $invitations) {
      id
      email
    }
  }
`

export const ManageInvitationRow = ({
  invitation,
  teamId,
  refetch,
  setSnackSuccessMessage,
  setSnackErrorMessage,
}: ManageInvitationRowProps) => {
  const [deleteInvitationFunction, { data: deleteData, error: deleteError }] =
    useMutation<DeleteInvitation, DeleteInvitationVariables>(
      CANCEL_INVITATION_MUTATION
    )

  const [updateRoleFunction, { data: updateData, error: updateError }] =
    useMutation<UpdateInvitation, UpdateInvitationVariables>(
      UPDATE_INVITATION_MUTATION
    )

  const handleDelete = () => {
    deleteInvitationFunction({
      variables: {
        teamId,
        email: invitation.email,
      },
    })
  }

  const handleChangeRole = (e: React.ChangeEvent) => {
    const newRole = (e.target as HTMLInputElement).value

    if (newRole === invitation.role) return
    if (newRole !== 'MEMBER' && newRole !== 'ADMIN') {
      throw new Error('Invalid role')
    }

    updateRoleFunction({
      variables: {
        teamId,
        invitations: [
          {
            email: invitation.email,
            role: newRole,
          },
        ],
      },
    })
  }

  useEffect(() => {
    if (deleteData) {
      setSnackSuccessMessage('Invitation cancelled successfully')
      refetch()
    }
  }, [deleteData, refetch, setSnackSuccessMessage])

  useEffect(() => {
    if (updateData) {
      setSnackSuccessMessage('Invitation updated successfully')
      refetch()
    }
  }, [refetch, setSnackSuccessMessage, updateData])

  useEffect(() => {
    if (deleteError) {
      setSnackErrorMessage('An error occured while cancelling that invitation')
    }
  }, [deleteError, setSnackErrorMessage])

  useEffect(() => {
    if (updateError) {
      setSnackErrorMessage('An error occured while updating that invitation')
    }
  }, [setSnackErrorMessage, updateError])

  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ minWidth: 200, width: 200 }}>
            <Tooltip title="Change Role">
              <TextField
                select
                fullWidth
                label="Role"
                value={invitation.role}
                size="small"
                onChange={handleChangeRole}
              >
                <MenuItem value="MEMBER">Member</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </TextField>
            </Tooltip>
          </Box>
          <Tooltip title="Cancel Invitation">
            <IconButton onClick={handleDelete}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <ListItemAvatar>
        <Avatar src="" />
      </ListItemAvatar>
      <ListItemText primary={invitation.email} />
    </ListItem>
  )
}
