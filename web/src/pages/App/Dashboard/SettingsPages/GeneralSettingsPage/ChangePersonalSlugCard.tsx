import { useState } from 'react'

import { Workspace } from '@apiteam/types/src'
import {
  Stack,
  Card,
  Divider,
  Typography,
  useTheme,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material'
import { useFormik } from 'formik'
import { UpdatePersonalSlug, UpdatePersonalSlugVariables } from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

import { useRefetchScopesCallback } from 'src/entity-engine/EntityEngine'

type ChangePersonalSlugCardProps = {
  workspaceInfo: Workspace
}

const UPDATE_TEAM_NAME_MUTATION = gql`
  mutation UpdatePersonalSlug($slug: String!) {
    updateCurrentUser(slug: $slug) {
      id
      slug
    }
  }
`

export const ChangePersonalSlugCard = ({
  workspaceInfo,
}: ChangePersonalSlugCardProps) => {
  const theme = useTheme()
  const refetchScopes = useRefetchScopesCallback()

  const formik = useFormik({
    initialValues: {
      personalSlug: workspaceInfo.scope.slug,
      submit: null,
    },
    validationSchema: Yup.object({
      // Ensure personal slug only contains alphanumeric characters and spaces
      personalSlug: Yup.string().matches(
        /^[a-zA-Z0-9 ]*$/,
        'Personal slug can only contain alphanumeric characters and spaces'
      ),
    }),
    onSubmit: async () => {
      await updatePersonalSlug({
        variables: {
          slug: formik.values.personalSlug,
        },
      })
      formik.setSubmitting(false)
    },
  })

  const [updatePersonalSlug] = useMutation<
    UpdatePersonalSlug,
    UpdatePersonalSlugVariables
  >(UPDATE_TEAM_NAME_MUTATION, {
    onCompleted: (data) => {
      setSnackSuccessMessage(
        `Successfully updated personal slug to ${data.updateCurrentUser.slug}`
      )
      refetchScopes?.()
    },
    onError: (error) => setSnackErrorMessage(error.message),
  })

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )
  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  return (
    <>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Card>
          <Stack spacing={2} p={2}>
            <Typography variant="h6">Personal Slug</Typography>
            <Typography variant="body2">
              This is your personal slug, it your unique identifier and personal
              subdomain on the APIPersonal platform
            </Typography>
            <TextField
              fullWidth
              id="personalSlug"
              name="personalSlug"
              label="Personal Slug"
              value={formik.values.personalSlug}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(
                formik.touched.personalSlug && formik.errors.personalSlug
              )}
              helperText={
                formik.touched.personalSlug && formik.errors.personalSlug
              }
            />
            <Divider />
            <Box
              sx={{
                alignSelf: 'flex-end',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                sx={{
                  color: theme.palette.background.paper,
                  borderColor: theme.palette.background.paper,
                }}
                type="submit"
                disabled={formik.isSubmitting}
              >
                Save
              </Button>
            </Box>
          </Stack>
        </Card>
      </form>
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
