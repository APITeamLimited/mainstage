import { useEffect } from 'react'

import { useFormik } from 'formik'
import {
  BillingAddressMutation,
  BillingAddressMutationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import { snackSuccessMessageVar } from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useBillingAddress } from '../BillingProvider'
import { billingAddressValidationSchema } from '../stripe'

const BILLING_ADDRESS_MUTATION = gql`
  mutation BillingAddressMutation(
    $teamId: String
    $input: UpdateCustomerInput!
  ) {
    updateCustomer(teamId: $teamId, input: $input) {
      id
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

export const useBillingForm = () => {
  const workspaceInfo = useWorkspaceInfo()
  const addressInfo = useBillingAddress()

  const [updateBillingAddress] = useMutation<
    BillingAddressMutation,
    BillingAddressMutationVariables
  >(BILLING_ADDRESS_MUTATION, {
    onCompleted: ({ updateCustomer: { address } }) => {
      snackSuccessMessageVar('Billing address successfully updated.')

      if (addressInfo) {
        addressInfo.refetchAddress()
      }

      // Prevent flash, use mutation data here
      if (address) {
        formik.setValues({
          country: address.country || 'US',
          line1: address.line1 || '',
          line2: address.line2 || '',
          postal_code: address.postal_code || '',
          city: address.city || '',
          state: address.state || '',
          submit: null,
        })
      }
    },
    onError: (error) => {
      formik.setFieldError(
        'submit',
        `Error updating billing address: ${error.message}`
      )
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
    validationSchema: billingAddressValidationSchema,
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
              postal_code: values.postal_code.toUpperCase(),
              state: values.state,
            },
          },
        },
      })

      formik.setSubmitting(false)
    },
  })

  return { formik }
}
