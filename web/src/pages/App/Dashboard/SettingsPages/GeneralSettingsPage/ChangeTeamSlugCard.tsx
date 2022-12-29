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
} from '@mui/material'
import { useFormik } from 'formik'
import { UpdateTeamSlug, UpdateTeamSlugVariables } from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useRefetchScopesCallback } from 'src/entity-engine/EntityEngine'

type ChangeTeamSlugCardProps = {
  workspaceInfo: Workspace
}

const UPDATE_TEAM_NAME_MUTATION = gql`
  mutation UpdateTeamSlug($teamId: String!, $slug: String!) {
    updateTeam(teamId: $teamId, slug: $slug) {
      id
      slug
    }
  }
`

export const ChangeTeamSlugCard = ({
  workspaceInfo,
}: ChangeTeamSlugCardProps) => {
  const theme = useTheme()
  const refetchScopes = useRefetchScopesCallback()

  const formik = useFormik({
    initialValues: {
      teamSlug: workspaceInfo.scope.slug,
      submit: null,
    },
    validationSchema: Yup.object({
      // Ensure team slug only contains alphanumeric characters and spaces
      teamSlug: Yup.string().matches(
        /^[a-zA-Z0-9 ]*$/,
        'Team slug can only contain alphanumeric characters and spaces'
      ),
    }),
    onSubmit: async () => {
      await updateTeamSlug({
        variables: {
          teamId: workspaceInfo.scope.variantTargetId,
          slug: formik.values.teamSlug,
        },
      })
      formik.setSubmitting(false)
    },
  })

  const [updateTeamSlug] = useMutation<UpdateTeamSlug, UpdateTeamSlugVariables>(
    UPDATE_TEAM_NAME_MUTATION,
    {
      onCompleted: (data) => {
        snackSuccessMessageVar(
          `Successfully updated team slug to ${data.updateTeam.slug}`
        )
        refetchScopes?.()
      },
      onError: (error) => snackErrorMessageVar(error.message),
    }
  )

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Team Slug
          </Typography>
          <Typography variant="body2">
            This is your team&apos;s slug, it is a unique identifier for your
            team as well as its subdomain on the APITeam platform.
          </Typography>
          <TextField
            fullWidth
            id="teamSlug"
            name="teamSlug"
            value={formik.values.teamSlug}
            onChange={formik.handleChange}
            size="small"
            error={Boolean(formik.touched.teamSlug && formik.errors.teamSlug)}
            helperText={formik.touched.teamSlug && formik.errors.teamSlug}
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
  )
}
