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
  SendAccountDeleteEmail,
  SendAccountDeleteEmailVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

type DeleteAccountCardProps = {
  workspaceInfo: Workspace
}

const SEND_ACCOUNT_DELETE_EMAIL = gql`
  mutation SendAccountDeleteEmail {
    sendAccountDeleteEmail
  }
`

export const DeleteAccountCard = ({
  workspaceInfo,
}: DeleteAccountCardProps) => {
  const theme = useTheme()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const formik = useFormik({
    initialValues: {
      accountSlug: '',
      confirmation: '',
      submit: null,
    },
    validationSchema: Yup.object({
      accountSlug: Yup.string().oneOf(
        [workspaceInfo.scope.slug],
        'Slugs must match'
      ),
      confirmation: Yup.string().oneOf(
        ['delete my account'],
        'You must type "delete my account"'
      ),
    }),
    onSubmit: async () => {
      await sendAccountDeleteEmail()
      formik.setSubmitting(false)
    },
  })

  const [sendAccountDeleteEmail] = useMutation<
    SendAccountDeleteEmail,
    SendAccountDeleteEmailVariables
  >(SEND_ACCOUNT_DELETE_EMAIL, {
    onCompleted: () => {
      handleDialogClose()
      setSnackSuccessMessage(
        'An email with a final confirmation link has been sent to your email address.'
      )
    },
    onError: (error) => {
      setSnackErrorMessage(error.message)
    },
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
            Delete Account
          </Typography>
          <Typography variant="body2" color={theme.palette.background.paper}>
            Deletes your APITeam account and all of its data. Make sure
            you&apos;re not the owner of any teams before deleting your account.
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
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Delete Account
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
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DialogContentText>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </DialogContentText>
              <DialogContentText>
                A link shall be sent to your inbox to confirm the deletion of
                your account. Once confirmed, all data will be permanently
                deleted.
              </DialogContentText>
              <Alert severity="error">
                <strong>Warning:</strong> This action cannot be undone.
              </Alert>
              <Divider />
              <FormHelperText>
                To confirm, type the slug of your account &apos;
                {workspaceInfo.scope.slug}&apos;
              </FormHelperText>
              <TextField
                label="Account Slug"
                variant="outlined"
                fullWidth
                size="small"
                name="accountSlug"
                value={formik.values.accountSlug}
                onChange={formik.handleChange}
                error={Boolean(
                  formik.touched.accountSlug && formik.errors.accountSlug
                )}
                helperText={
                  formik.touched.accountSlug && formik.errors.accountSlug
                }
              />
              <FormHelperText>
                Type &apos;delete my account&apos; to confirm
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
                formik.values.accountSlug === '' ||
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
