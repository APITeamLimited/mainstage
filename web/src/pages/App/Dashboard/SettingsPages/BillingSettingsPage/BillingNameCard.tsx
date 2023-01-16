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
  BillingNameQuery,
  BillingNameQueryVariables,
  BillingNameMutation,
  BillingNameMutationVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation, useQuery } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const CUSTOMER_NAME_QUERY = gql`
  query BillingNameQuery($teamId: String) {
    customer(teamId: $teamId) {
      name
    }
  }
`

const CUSTOMER_NAME_MUTATION = gql`
  mutation BillingNameMutation($teamId: String, $name: String!) {
    updateCustomer(teamId: $teamId, input: { name: $name }) {
      name
    }
  }
`

const nameSkeletonHeight = 192.5

export const BillingNameCard = () => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: nameData } = useQuery<
    BillingNameQuery,
    BillingNameQueryVariables
  >(CUSTOMER_NAME_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
  })

  const [updateBillingName] = useMutation<
    BillingNameMutation,
    BillingNameMutationVariables
  >(CUSTOMER_NAME_MUTATION, {
    onCompleted: (data) => {
      snackSuccessMessageVar(
        `Billing name updated to ${data.updateCustomer.name}`
      )
      formik.setFieldValue('name', data.updateCustomer.name)
    },
    onError: (error) => {
      snackErrorMessageVar(`Error updating billing name: ${error.message}`)
    },
  })

  const formik = useFormik({
    initialValues: {
      name: nameData?.customer?.name || '',
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required(`Company name is required`),
    }),
    onSubmit: async () => {
      await updateBillingName({
        variables: {
          teamId: workspaceInfo.isTeam
            ? workspaceInfo.scope.variantTargetId
            : null,
          name: formik.values.name,
        },
      })
      formik.setSubmitting(false)
    },
  })

  // Customer email is loaded asynchronously, so we need to set the formik value
  useEffect(() => {
    formik.setFieldValue('name', nameData?.customer?.name || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameData])

  return nameData ? (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Billing Name
          </Typography>
          <Typography variant="body2">
            Your {workspaceInfo.isTeam ? 'team name' : 'username'} is used as
            the default name for invoices. If you want to use a different name,
            {workspaceInfo.isTeam
              ? ' for instance your company name, '
              : ' '}{' '}
            you can change it here.
          </Typography>
          <TextField
            fullWidth
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            size="small"
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
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
    <Skeleton height={nameSkeletonHeight} />
  )
}
