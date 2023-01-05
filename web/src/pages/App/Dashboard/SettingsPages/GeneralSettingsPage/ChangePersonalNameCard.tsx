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
import { UpdatePersonalName, UpdatePersonalNameVariables } from 'types/graphql'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'
import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useRefetchScopesCallback } from 'src/entity-engine/EntityEngine'

const UPDATE_PERSONAL_NAME_MUTATION = gql`
  mutation UpdatePersonalName($firstName: String!, $lastName: String!) {
    updateCurrentUser(firstName: $firstName, lastName: $lastName) {
      firstName
      lastName
    }
  }
`

export const ChangePersonalNameCard = () => {
  const theme = useTheme()
  const refetchScopes = useRefetchScopesCallback()
  const { currentUser } = useAuth()

  if (!currentUser) {
    throw new Error('User not found')
  }

  const formik = useFormik({
    initialValues: {
      fullName: `${currentUser.firstName} ${currentUser.lastName}`,
      submit: null,
    },
    validationSchema: Yup.object({
      // Ensure personal slug only contains alphanumeric characters and spaces
      fullName: Yup.string().test(
        'fullName',
        'First and Last names are required and can only contain alphanumeric characters',
        (value) => {
          if (!value) {
            return false
          }

          // Ensure only one space
          if (value.split(' ').length > 2) {
            return false
          }

          const [firstName, lastName] = value.split(' ')

          // Ensure first and last name are present and at least 1 character
          if (!firstName || !lastName) {
            return false
          }

          // Ensure first and last name are present and alphanumeric

          return (
            firstName.match(/^[a-zA-Z0-9]*$/) !== null &&
            lastName.match(/^[a-zA-Z0-9]*$/) !== null
          )
        }
      ),
    }),
    onSubmit: async () => {
      await updatePersonalName({
        variables: {
          firstName: formik.values.fullName.split(' ')[0],
          lastName: formik.values.fullName.split(' ')[1],
        },
      })
      formik.setSubmitting(false)
    },
  })

  const [updatePersonalName] = useMutation<
    UpdatePersonalName,
    UpdatePersonalNameVariables
  >(UPDATE_PERSONAL_NAME_MUTATION, {
    onCompleted: (data) => {
      snackSuccessMessageVar(
        `Successfully updated your name to ${data.updateCurrentUser.firstName} ${data.updateCurrentUser.lastName}`
      )
      refetchScopes?.()
    },
    onError: (error) => snackErrorMessageVar(error.message),
  })

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Your Name
          </Typography>
          <Typography variant="body2">
            Your first and last name, this will be displayed on your profile.
          </Typography>
          <TextField
            fullWidth
            id="fullName"
            name="fullName"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            size="small"
            error={Boolean(formik.touched.fullName && formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
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
