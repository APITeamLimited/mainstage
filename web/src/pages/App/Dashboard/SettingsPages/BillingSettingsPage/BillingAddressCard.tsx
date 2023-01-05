import { useState, useEffect } from 'react'

import {
  Stack,
  Card,
  Divider,
  Typography,
  Button,
  Box,
  Skeleton,
  TextField,
  MenuItem,
} from '@mui/material'
import { useFormik } from 'formik'
import {
  BillingAddressMutation,
  BillingAddressMutationVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useBillingAddress } from './BillingAddressProvider'
import { countryCodes, stripeCountries } from './payment-components'

const BILLING_ADDRESS_MUTATION = gql`
  mutation BillingAddressMutation(
    $teamId: String
    $input: UpdateCustomerInput!
  ) {
    updateCustomer(teamId: $teamId, input: $input) {
      address {
        city
        country
        line1
        line2
        postal_code
        state
      }
    }
  }
`

const billingAddressSkeletonHeight = 300

export const BillingAddressCard = () => {
  const workspaceInfo = useWorkspaceInfo()
  const addressInfo = useBillingAddress()

  const [formError, setFormError] = useState<string | null>(null)

  const [updateBillingAddress] = useMutation<
    BillingAddressMutation,
    BillingAddressMutationVariables
  >(BILLING_ADDRESS_MUTATION, {
    onCompleted: () => {
      snackSuccessMessageVar('Billing address successfully updated.')

      if (addressInfo) {
        addressInfo.refetchAddress()
      }

      setFormError(null)
    },
    onError: (error) => {
      snackErrorMessageVar(`Error updating billing address: ${error.message}`)
    },
  })

  useEffect(() => {
    if (addressInfo?.customerAddress) {
      formik.setValues({
        country: addressInfo?.customerAddress?.country || 'US',
        line1: addressInfo?.customerAddress?.line1 || '',
        line2: addressInfo?.customerAddress?.line2 || '',
        postal_code: addressInfo?.customerAddress?.postal_code || '',
        city: addressInfo?.customerAddress?.city || '',
        state: addressInfo?.customerAddress?.state || '',
        submit: null,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressInfo?.customerAddress])

  const formik = useFormik({
    initialValues: {
      country: addressInfo?.customerAddress?.country || 'US',
      line1: addressInfo?.customerAddress?.line1 || '',
      line2: '',
      postal_code: '',
      city: '',
      state: '',
      submit: null,
    },
    validationSchema: Yup.object({
      country: Yup.string()
        .required('Please select a country')
        .oneOf(countryCodes)
        .default('US'),

      line1: Yup.string().required('Please enter a street address'),
      // TODO: Figure out if some countries don't require a postal code
      postal_code: Yup.string().required('Please enter your postal/zip code'),
    }),
    onSubmit: (values) => {
      updateBillingAddress({
        variables: {
          teamId: workspaceInfo.isTeam
            ? workspaceInfo.scope.variantTargetId
            : null,
          input: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.line1,
              line2: values.line2,
              postal_code: values.postal_code,
              state: values.state,
            },
          },
        },
      })

      formik.setSubmitting(false)
    },
  })

  return addressInfo ? (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Billing Address
          </Typography>
          <Typography variant="body2">
            Enter the billing address for your{' '}
            {workspaceInfo.isTeam ? 'team' : 'account'}. This will be used for
            all billing and invoicing. This can be personal or business.
          </Typography>
          <Stack spacing={2} direction="row">
            <TextField
              fullWidth
              value={formik.values.country}
              label="Country"
              id="country"
              size="small"
              select
            >
              {stripeCountries.map((country) => (
                <MenuItem
                  key={country.code}
                  value={country.code}
                  // Event only seems to fire on MenuItem not TextField
                  onClick={() => formik.setFieldValue('country', country.code)}
                >
                  {country.country}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              id="postal_code"
              label={
                formik.values.country === 'US' ? 'Zip Code' : 'Postal Code'
              }
              value={formik.values.postal_code}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(
                formik.touched.postal_code && formik.errors.postal_code
              )}
              helperText={
                formik.touched.postal_code && formik.errors.postal_code
              }
            />
          </Stack>
          <TextField
            fullWidth
            id="line1"
            label="Street Address"
            value={formik.values.line1}
            onChange={formik.handleChange}
            size="small"
            error={Boolean(formik.touched.line1 && formik.errors.line1)}
            helperText={formik.touched.line1 && formik.errors.line1}
          />
          <TextField
            fullWidth
            id="line2"
            label="Apt, Suite, etc."
            value={formik.values.line2}
            onChange={formik.handleChange}
            size="small"
            error={Boolean(formik.touched.line1 && formik.errors.line1)}
            helperText={formik.touched.line1 && formik.errors.line1}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              id="city"
              label="City"
              value={formik.values.city}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(formik.touched.city && formik.errors.city)}
              helperText={formik.touched.city && formik.errors.city}
            />
            <TextField
              fullWidth
              id="state"
              label="State"
              value={formik.values.state}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(formik.touched.state && formik.errors.state)}
              helperText={formik.touched.state && formik.errors.state}
            />
          </Stack>

          {formError && (
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          )}
          {formik.errors.submit && (
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          )}
          <Divider />
          <Box
            sx={{
              alignSelf: 'flex-end',
            }}
          >
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
          </Box>
        </Stack>
      </Card>
    </form>
  ) : (
    <Skeleton height={billingAddressSkeletonHeight} />
  )
}
