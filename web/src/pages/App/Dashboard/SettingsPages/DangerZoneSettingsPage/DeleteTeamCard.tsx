import { useState } from 'react'

import { Workspace } from '@apiteam/types/src'
import {
  Stack,
  Card,
  Divider,
  Typography,
  useTheme,
  TextField,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  FormHelperText,
  Snackbar,
  Alert,
  Dialog,
} from '@mui/material'
import { useFormik } from 'formik'
import {
  SendTeamDeleteEmail,
  SendTeamDeleteEmailVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

type DeleteTeamCardProps = {
  workspaceInfo: Workspace
}

const SEND_DELETE_TEAM_EMAIL = gql`
  mutation SendTeamDeleteEmail($teamId: String!) {
    sendDeleteTeamEmail(teamId: $teamId)
  }
`

export const DeleteTeamCard = ({ workspaceInfo }: DeleteTeamCardProps) => {
  const theme = useTheme()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const formik = useFormik({
    initialValues: {
      teamName: '',
      confirmation: '',
      submit: null,
    },
    validationSchema: Yup.object({
      teamName: Yup.string().oneOf(
        [workspaceInfo.scope.slug],
        'Slugs must match'
      ),
      confirmation: Yup.string().oneOf(
        ['delete my team'],
        'You must type "delete my team"'
      ),
    }),
    onSubmit: async () => {
      await sendDeleteTeamEmail({
        variables: {
          teamId: workspaceInfo.scope.variantTargetId,
        },
      })
      formik.setSubmitting(false)
    },
  })

  const [sendDeleteTeamEmail] = useMutation<
    SendTeamDeleteEmail,
    SendTeamDeleteEmailVariables
  >(SEND_DELETE_TEAM_EMAIL, {
    onCompleted: () => {
      handleDialogClose()
      setSnackSuccessMessage(
        'An email with a final confirmation link has been sent to your email address.'
      )
    },
    onError: (error) => setSnackErrorMessage(error.message),
  })

  const handleDialogClose = () => {
    setShowDeleteConfirmation(false)
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
      <Card sx={{ backgroundColor: theme.palette.error.light }}>
        <Stack spacing={2} p={2}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={theme.palette.background.paper}
          >
            Delete Team
          </Typography>
          <Typography variant="body2" color={theme.palette.background.paper}>
            Deletes your team, including all its projects and data.
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
                color: theme.palette.background.paper,
                borderColor: theme.palette.background.paper,
              }}
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Delete Team
            </Button>
          </Box>
        </Stack>
      </Card>
      <Dialog
        open={showDeleteConfirmation}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                Are you sure you want to delete your team? This action cannot be
                undone.
              </DialogContentText>
              <DialogContentText>
                A link shall be sent to your inbox to confirm the deletion of
                your team. Once confirmed, all data will be permanently deleted.
              </DialogContentText>
              <Alert severity="error">
                <strong>Warning:</strong> This action cannot be undone.
              </Alert>
              <Divider />
              <FormHelperText>
                To confirm, type the slug of your team{' '}
                <strong>{workspaceInfo.scope.slug}</strong>
              </FormHelperText>
              <TextField
                label="Team Name"
                variant="outlined"
                fullWidth
                size="small"
                name="teamName"
                value={formik.values.teamName}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.teamName && formik.errors.teamName
                )}
                helperText={formik.touched.teamName && formik.errors.teamName}
              />
              <FormHelperText>
                Type <strong>delete my team</strong> to confirm
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
                formik.values.teamName === '' ||
                formik.values.confirmation === ''
              }
            >
              Delete
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
