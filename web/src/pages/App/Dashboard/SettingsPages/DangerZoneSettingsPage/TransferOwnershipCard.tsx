import { useState } from 'react'

import { Workspace } from '@apiteam/types/src'
import {
  Stack,
  Card,
  Divider,
  Typography,
  MenuItem,
  TextField,
  Button,
  Box,
  FormHelperText,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import { useFormik } from 'formik'
import {
  ListTeamMembers,
  ListTeamMembersVariables,
  SendChangeTeamOwnerEmail,
  SendChangeTeamOwnerEmailVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation, useQuery } from '@redwoodjs/web'

import { LIST_TEAM_MEMBERS } from '../MembersSettingsPage/ManageTeamMembers'

type TransferOwnershipCardProps = {
  workspaceInfo: Workspace
}

const SEND_CHANGE_OWNER_EMAIL = gql`
  mutation SendChangeTeamOwnerEmail($teamId: String!, $userId: String!) {
    sendChangeTeamOwnerEmail(teamId: $teamId, userId: $userId)
  }
`

export const TransferOwnershipCard = ({
  workspaceInfo,
}: TransferOwnershipCardProps) => {
  const { data } = useQuery<ListTeamMembers, ListTeamMembersVariables>(
    LIST_TEAM_MEMBERS,
    {
      variables: { teamId: workspaceInfo.scope.variantTargetId },
      pollInterval: 5000,
      onCompleted(data) {
        if (
          (
            data?.memberships
              .filter((m) => m.role === 'ADMIN')
              .map((m) => m.user.email) || []
          ).length === 0
        ) {
          setShowTransferOwnershipConfirmation(false)
        }
      },
    }
  )

  const [sendChangeOwnerEmail] = useMutation<
    SendChangeTeamOwnerEmail,
    SendChangeTeamOwnerEmailVariables
  >(SEND_CHANGE_OWNER_EMAIL, {
    onCompleted: () => {
      handleDialogClose()
      setSnackSuccessMessage(
        'Success, a confirmation email has been sent to your inbox.'
      )
    },
    onError: (error) => setSnackErrorMessage(error.message),
  })

  const formik = useFormik({
    initialValues: {
      newOwner: '',
      confirmation: '',
      submit: null,
    },
    validationSchema: Yup.object({
      newOwner: Yup.string().oneOf(
        data?.memberships
          .filter((m) => m.role === 'ADMIN')
          .map((m) => m.user.email) || [],
        'Must select a valid user'
      ),
      confirmation: Yup.string().oneOf(
        ['transfer ownership'],
        'You must type "transfer ownership"'
      ),
    }),
    onSubmit: async (values) => {
      const userId = data?.memberships.find(
        (m) => m.user.email === values.newOwner
      )?.user.id

      if (!userId) throw new Error('User not found')

      await sendChangeOwnerEmail({
        variables: {
          teamId: workspaceInfo.scope.variantTargetId,
          userId,
        },
      })
      formik.setSubmitting(false)
    },
  })

  const [
    showTransferOwnershipConfirmation,
    setShowTransferOwnershipConfirmation,
  ] = useState(false)

  const handleDialogClose = () => {
    setShowTransferOwnershipConfirmation(false)
    formik.resetForm()
  }

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )
  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  return (
    <>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Transfer Ownership
          </Typography>
          <Typography variant="body2">
            Transfer ownership of this team to another admin, you will be remain
            an admin.
          </Typography>
          <Divider />
          <Box
            sx={{
              alignSelf: 'flex-end',
            }}
          >
            {(
              data?.memberships
                .filter((m) => m.role === 'ADMIN')
                .map((m) => m.user.email) || []
            ).length > 0 ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowTransferOwnershipConfirmation(true)}
              >
                Transfer Ownership
              </Button>
            ) : (
              <Tooltip title="You must have at least one admin to transfer ownership">
                <span>
                  <Button
                    variant="contained"
                    color="error"
                    disabled
                    onClick={() => setShowTransferOwnershipConfirmation(true)}
                  >
                    Transfer Ownership
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Stack>
      </Card>
      <Dialog
        open={showTransferOwnershipConfirmation}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle>Transfer Ownerhip</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                Are you sure you want to transfer ownership of this team? This
                action cannot be undone.
              </DialogContentText>
              <DialogContentText>
                Please select a new owner from the list below. You will remain
                an admin. A confirmation email will be sent to your inbox.
              </DialogContentText>
              <Alert severity="warning">
                <strong>Warning:</strong> This action cannot be undone.
              </Alert>
              <Divider />
              <FormHelperText>
                To confirm, type the slug of your team{' '}
                <strong>{workspaceInfo.scope.slug}</strong>
              </FormHelperText>
              <TextField
                fullWidth
                label="New Owner"
                variant="outlined"
                select
                size="small"
                value={formik.values.newOwner}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.newOwner && formik.errors.newOwner
                )}
                helperText={formik.touched.newOwner && formik.errors.newOwner}
                name="newOwner"
              >
                {data?.memberships
                  .filter((m) => m.role === 'ADMIN')
                  .map((m) => (
                    <MenuItem key={m.user.id} value={m.user.email}>
                      {m.user.email}
                    </MenuItem>
                  ))}
              </TextField>

              <FormHelperText>
                Type &apos;transfer ownership&apos; to confirm
              </FormHelperText>
              <TextField
                label="Confirmation"
                variant="outlined"
                fullWidth
                name="confirmation"
                size="small"
                value={formik.values.confirmation}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.confirmation && formik.errors.confirmation
                )}
                helperText={
                  formik.touched.confirmation && formik.errors.confirmation
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              color="error"
              type="submit"
              disabled={
                formik.isSubmitting ||
                !formik.isValid ||
                formik.values.newOwner === '' ||
                formik.values.confirmation === ''
              }
            >
              Transfer Ownership
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => setSnackErrorMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
