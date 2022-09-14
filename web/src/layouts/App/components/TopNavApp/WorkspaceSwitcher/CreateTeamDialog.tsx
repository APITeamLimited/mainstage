import { useApolloClient } from '@apollo/client'
import {
  Button,
  Dialog,
  DialogContent,
  TextField,
  DialogTitle,
  DialogActions,
  Stack,
  Typography,
  FormHelperText,
} from '@mui/material'
import { useFormik } from 'formik'
import { CreateTeam } from 'types/graphql'
import * as Yup from 'yup'

import { navigate, routes } from '@redwoodjs/router'

import { activeWorkspaceIdVar } from 'src/contexts/reactives'
import { useRefetchScopesCallback } from 'src/entity-engine/EntityEngine'

type CreateTeamDialogProps = {
  isOpen: boolean
  onClose: (successful: boolean) => void
}

export const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam($name: String!, $slug: String!) {
    createTeam(name: $name, slug: $slug) {
      id
      name
    }
  }
`

export const CreateTeamDialog = ({
  isOpen,
  onClose,
}: CreateTeamDialogProps) => {
  const apolloClient = useApolloClient()
  const fetchScopesCallback = useRefetchScopesCallback()

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(25).required('Teams must have a name'),
      slug: Yup.string().max(25).required('Teams must have a slug'),
    }),
    onSubmit: async (values): Promise<void> => {
      try {
        const { data } = await apolloClient.mutate<CreateTeam>({
          mutation: CREATE_TEAM_MUTATION,
          variables: {
            name: values.name,
            slug: values.slug,
          },
        })

        if (!data?.createTeam) {
          formik.setFieldError('submit', 'Unknown error creating team')
          return
        }

        activeWorkspaceIdVar(data.createTeam.id)
        navigate(
          routes.dashboard({
            requestedWorkspaceId: data.createTeam.id,
          })
        )
        // Reload the page to get the new workspace
        window.location.reload()
        handleClose(true)
      } catch (error) {
        formik.setFieldError('submit', String(error))
      }
    },
  })

  const handleClose = (successful: boolean) => {
    formik.resetForm()
    onClose(successful)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={() => handleClose(false)}
      maxWidth="xs"
      fullWidth
    >
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>Create Team</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body1">
              Create a team to collaborate with others, collaborative teams are
              more productive.
            </Typography>
            <TextField
              id="name"
              label="Team Name"
              name="name"
              fullWidth
              variant="outlined"
              size="small"
              value={formik.values.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              id="slug"
              label="Team Slug"
              name="slug"
              fullWidth
              variant="outlined"
              size="small"
              value={formik.values.slug}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.slug && formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
              multiline
            />
            <Typography variant="body1">
              Creating a team will not impact your personal account and its
              projects
            </Typography>
            {formik.errors.submit && (
              <FormHelperText error>{formik.errors.submit}</FormHelperText>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>Cancel</Button>
          <Button type="submit" disabled={formik.isSubmitting}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
