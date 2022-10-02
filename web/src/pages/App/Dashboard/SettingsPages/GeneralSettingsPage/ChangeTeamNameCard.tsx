import { useState } from 'react'

import { Workspace } from '@apiteam/types'
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
import { UpdateTeamName, UpdateTeamNameVariables } from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

import { useRefetchScopesCallback } from 'src/entity-engine/EntityEngine'

type ChangeTeamNameCardProps = {
  workspaceInfo: Workspace
}

const UPDATE_TEAM_NAME_MUTATION = gql`
  mutation UpdateTeamName($teamId: String!, $name: String!) {
    updateTeam(teamId: $teamId, name: $name) {
      id
      name
    }
  }
`

export const ChangeTeamNameCard = ({
  workspaceInfo,
}: ChangeTeamNameCardProps) => {
  const theme = useTheme()
  const refetchScopes = useRefetchScopesCallback()

  const formik = useFormik({
    initialValues: {
      teamName: workspaceInfo.scope.displayName,
      submit: null,
    },
    validationSchema: Yup.object({
      // Ensure team name only contains alphanumeric characters and spaces
      teamName: Yup.string().matches(
        /^[a-zA-Z0-9 ]*$/,
        'Team name can only contain alphanumeric characters and spaces'
      ),
    }),
    onSubmit: async () => {
      await updateTeamName({
        variables: {
          teamId: workspaceInfo.scope.variantTargetId,
          name: formik.values.teamName,
        },
      })
      formik.setSubmitting(false)
    },
  })

  const [updateTeamName] = useMutation<UpdateTeamName, UpdateTeamNameVariables>(
    UPDATE_TEAM_NAME_MUTATION,
    {
      onCompleted: (data) => {
        setSnackSuccessMessage(
          `Successfully updated team name to ${data.updateTeam.name}`
        )
        refetchScopes?.()
      },
      onError: (error) => setSnackErrorMessage(error.message),
    }
  )

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
            <Typography variant="h6">Team Name</Typography>
            <Typography variant="body2">
              This is your team&apos;s publicly available name. This could be
              the name of your company or department.
            </Typography>
            <TextField
              fullWidth
              id="teamName"
              name="teamName"
              label="Team Name"
              value={formik.values.teamName}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(formik.touched.teamName && formik.errors.teamName)}
              helperText={formik.touched.teamName && formik.errors.teamName}
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
