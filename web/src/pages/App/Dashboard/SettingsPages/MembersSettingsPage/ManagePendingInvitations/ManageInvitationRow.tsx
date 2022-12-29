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
} from '@mui/material'
import {
  ListPendingInvitations,
  UpdateInvitation,
  DeleteInvitation,
  DeleteInvitationVariables,
  UpdateInvitationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'

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

type ManageInvitationRowProps = {
  invitation: ListPendingInvitations['invitations'][0]
  teamId: string
  refetch: () => void
}

export const ManageInvitationRow = ({
  invitation,
  teamId,
  refetch,
}: ManageInvitationRowProps) => {
  const [deleteInvitationFunction] = useMutation<
    DeleteInvitation,
    DeleteInvitationVariables
  >(CANCEL_INVITATION_MUTATION, {
    onCompleted: () => {
      snackSuccessMessageVar('Invitation cancelled successfully')
      refetch()
    },
    onError: (error) =>
      snackErrorMessageVar(`Error cancelling invitation: ${error.message}`),
  })

  const [updateRoleFunction] = useMutation<
    UpdateInvitation,
    UpdateInvitationVariables
  >(UPDATE_INVITATION_MUTATION, {
    onCompleted: () => {
      snackSuccessMessageVar('Invitation updated successfully')
      refetch()
    },
    onError: (error) =>
      snackErrorMessageVar(`Error updating invitation: ${error.message}`),
  })

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
