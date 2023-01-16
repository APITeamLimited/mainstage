import { useEffect } from 'react'

import {
  Stack,
  Card,
  Divider,
  Typography,
  TextField,
  Button,
  Box,
  Skeleton,
} from '@mui/material'
import { useFormik } from 'formik'
import {
  BillingEmailQuery,
  BillingEmailQueryVariables,
  BillingEmailMutation,
  BillingEmailMutationVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation, useQuery } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const CUSTOMER_EMAIL_QUERY = gql`
  query BillingEmailQuery($teamId: String) {
    customer(teamId: $teamId) {
      email
    }
  }
`

const CUSTOMER_EMAIL_MUTATION = gql`
  mutation BillingEmailMutation($teamId: String, $email: String!) {
    updateCustomer(teamId: $teamId, input: { email: $email }) {
      email
    }
  }
`

const customerEmailSkeletonHeight = 192.5

export const BillingEmailCard = () => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: customerEmailData } = useQuery<
    BillingEmailQuery,
    BillingEmailQueryVariables
  >(CUSTOMER_EMAIL_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
  })

  const [updateBillingEmail] = useMutation<
    BillingEmailMutation,
    BillingEmailMutationVariables
  >(CUSTOMER_EMAIL_MUTATION, {
    onCompleted: (data) => {
      snackSuccessMessageVar(
        `Customer billing email updated to ${data.updateCustomer.email}`
      )
      formik.setFieldValue('customerEmail', data.updateCustomer.email)
    },
    onError: (error) => {
      snackErrorMessageVar(`Error updating billing email: ${error.message}`)
    },
  })

  const formik = useFormik({
    initialValues: {
      customerEmail: customerEmailData?.customer?.email || '',
      submit: null,
    },
    validationSchema: Yup.object({
      customerEmail: Yup.string().email('Invalid email address'),
    }),
    onSubmit: async () => {
      await updateBillingEmail({
        variables: {
          teamId: workspaceInfo.isTeam
            ? workspaceInfo.scope.variantTargetId
            : null,
          email: formik.values.customerEmail,
        },
      })
      formik.setSubmitting(false)
    },
  })

  // Customer email is loaded asynchronously, so we need to set the formik value
  useEffect(() => {
    formik.setFieldValue(
      'customerEmail',
      customerEmailData?.customer?.email || ''
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerEmailData])

  return customerEmailData ? (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Billing Email
          </Typography>
          <Typography variant="body2">
            By default, invoices are sent to the email address associated with{' '}
            {workspaceInfo.isTeam ? 'the team owner' : 'your account'}. To send
            invoices to a dedicated email address, enter it below.
          </Typography>
          <TextField
            fullWidth
            id="customerEmail"
            name="customerEmail"
            value={formik.values.customerEmail}
            onChange={formik.handleChange}
            size="small"
            error={Boolean(
              formik.touched.customerEmail && formik.errors.customerEmail
            )}
            helperText={
              formik.touched.customerEmail && formik.errors.customerEmail
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
              type="submit"
              disabled={formik.isSubmitting}
            >
              Save
            </Button>
          </Box>
        </Stack>
      </Card>
    </form>
  ) : (
    <Skeleton height={customerEmailSkeletonHeight} />
  )
}
