import { useEffect, useMemo, useState } from 'react'

import { useMutation } from '@apollo/client'
import ClearIcon from '@mui/icons-material/Clear'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import {
  Stack,
  Card,
  Divider,
  Typography,
  useTheme,
  MenuItem,
  TextField,
  Button,
  Box,
  FormHelperText,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material'
import { useFormik } from 'formik'
import { CreateInvitations } from 'types/graphql'
import * as Yup from 'yup'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

type InvitationInput = {
  email: string
  role: 'MEMBER' | 'ADMIN'
}[]

const ADD_NEW_MEMBERS_QUERY = gql`
  mutation CreateInvitations(
    $teamId: String!
    $invitations: [InvitationInput!]!
  ) {
    createInvitations(teamId: $teamId, invitations: $invitations) {
      id
    }
  }
`

type AddNewMemberProps = {
  incrementInvitationsCount: () => void
}

export const AddNewMember = ({
  incrementInvitationsCount,
}: AddNewMemberProps) => {
  const workspaceInfo = useWorkspaceInfo()
  const theme = useTheme()
  const [addMemberFunction, { data, error, reset }] =
    useMutation<CreateInvitations>(ADD_NEW_MEMBERS_QUERY)

  const teamId = useMemo(() => {
    if (!workspaceInfo?.scope) return null
    if (workspaceInfo.scope?.variant === 'USER') {
      return null
    } else {
      return workspaceInfo.scope.variantTargetId
    }
  }, [workspaceInfo])

  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (data) {
      setSnackSuccessMessage('Invitation sent')
    }
  }, [data])

  useEffect(() => {
    if (error) {
      setSnackErrorMessage('Error sending invitation')
    }
  }, [error])

  const formik = useFormik({
    initialValues: {
      pairs: [
        {
          email: '',
          role: 'MEMBER',
        },
      ] as InvitationInput,
      submit: null,
    },
    validationSchema: Yup.object({
      pairs: Yup.array().of(
        Yup.object({
          email: Yup.string()
            .email('Must be a valid email')
            .required('Email is required'),
          role: Yup.string()
            .oneOf(['MEMBER', 'ADMIN'])
            .required('Role is required'),
        })
      ),
    }),
    onSubmit: async (values): Promise<void> => {
      const { data } = await addMemberFunction({
        variables: {
          teamId,
          invitations: values.pairs,
        },
      })

      if (data) {
        incrementInvitationsCount()
        formik.resetForm()
        formik.setFieldValue('pairs', [
          {
            email: '',
            role: 'MEMBER',
          },
        ])
        reset()
      }
    },
  })

  useEffect(() => {
    if (error) {
      formik.setErrors({
        submit: error.message,
      })
      return
    }
  }, [data, error, formik])

  if (!teamId) return null

  return (
    <>
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
      <Card>
        <form noValidate onSubmit={formik.handleSubmit}>
          <Stack spacing={2} p={2}>
            <Typography variant="h6">Add New</Typography>
            <Divider />
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Invite new members to your team via email.
            </Typography>
            {formik.values.pairs.map((pair, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  value={pair.email}
                  onChange={(e) => {
                    const newPairs = [...formik.values.pairs]
                    newPairs[index].email = e.target.value
                    formik.setFieldValue('pairs', newPairs)
                  }}
                  error={
                    formik.errors.pairs?.[index]?.email &&
                    formik.touched.pairs?.[index]?.email
                  }
                  helperText={
                    formik.errors.pairs?.[index]?.email &&
                    formik.touched.pairs?.[index]?.email
                  }
                />
                <Box sx={{ minWidth: 200, width: 200 }}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    value={pair.role}
                    size="small"
                    onChange={(e) => {
                      const newPairs = [...formik.values.pairs]
                      newPairs[index].role = e.target.value as
                        | 'MEMBER'
                        | 'ADMIN'
                      formik.setFieldValue('pairs', newPairs)
                    }}
                    error={!!formik.errors.pairs?.[index]?.role}
                    helperText={formik.errors.pairs?.[index]?.role}
                  >
                    <MenuItem value="MEMBER">Member</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </TextField>
                </Box>
                <IconButton
                  onClick={() => {
                    const newPairs = [...formik.values.pairs]
                    newPairs.splice(index, 1)
                    formik.setFieldValue('pairs', newPairs)
                  }}
                  disabled={formik.values.pairs.length === 1}
                >
                  <ClearIcon />
                </IconButton>
              </Stack>
            ))}
            {formik.errors.submit && (
              <FormHelperText error>{formik.errors.submit}</FormHelperText>
            )}
            <Box>
              <Button
                startIcon={<ControlPointIcon />}
                variant="outlined"
                onClick={() => {
                  formik.setFieldValue('pairs', [
                    ...formik.values.pairs,
                    {
                      email: '',
                      role: 'MEMBER',
                    },
                  ])
                }}
              >
                Add Another
              </Button>
            </Box>
            <Divider />
            <Box alignSelf="flex-end">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={formik.isSubmitting}
              >
                Invite
              </Button>
            </Box>
          </Stack>
        </form>
      </Card>
    </>
  )
}
