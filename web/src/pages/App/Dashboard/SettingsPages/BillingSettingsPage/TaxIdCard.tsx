import { possibleTaxIdTypes } from '@apiteam/types/src'
import {
  Stack,
  Card,
  Divider,
  Typography,
  TextField,
  Button,
  Box,
  Skeleton,
  Tooltip,
  useTheme,
  MenuItem,
} from '@mui/material'
import { useFormik } from 'formik'
import {
  AddTaxIdMutationVariables,
  AddTaxIdMutation,
  TaxIdQuery,
  TaxIdQueryVariables,
  StripeTaxIdType,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation, useQuery } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useAddressStatus } from './stripe'

const TAX_ID_QUERY = gql`
  query TaxIdQuery($teamId: String) {
    taxId(teamId: $teamId) {
      id
      country
      customer
      type
      value
      verification {
        status
      }
    }
  }
`

const ADD_TAX_ID_MUTATION = gql`
  mutation AddTaxIdMutation(
    $teamId: String
    $type: StripeTaxIdType!
    $value: String!
  ) {
    addTaxId(teamId: $teamId, type: $type, value: $value) {
      id
      country
      customer
      type
      value
      verification {
        status
      }
    }
  }
`

const REMOVE_TAX_ID_MUTATION = gql`
  mutation RemoveTaxIdMutation($teamId: String) {
    removeTaxId(teamId: $teamId) {
      id
    }
  }
`

const taxIdSkeletonHeight = 192.5

export const TaxIdCard = () => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()
  const addressStatus = useAddressStatus()

  const { data: customerTaxData } = useQuery<TaxIdQuery, TaxIdQueryVariables>(
    TAX_ID_QUERY,
    {
      variables: {
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
      },
      onCompleted: (data) => {
        if (data.taxId) {
          formik.setFieldValue('taxIdType', data.taxId.type)
          formik.setFieldValue('taxIdValue', data.taxId.value)
        }
      },
    }
  )

  const [addTaxId] = useMutation<AddTaxIdMutation, AddTaxIdMutationVariables>(
    ADD_TAX_ID_MUTATION,
    {
      onCompleted: (data) => {
        snackSuccessMessageVar(
          `Successfuly set your tax ID to ${data.addTaxId.value}.`
        )
        formik.setFieldValue('taxIdType', data.addTaxId.type)
        formik.setFieldValue('taxIdValue', data.addTaxId.value)
      },
      onError: (error) => {
        snackErrorMessageVar(`Error adding tax ID: ${error.message}`)
      },
    }
  )

  const [removeTaxId] = useMutation(REMOVE_TAX_ID_MUTATION, {
    onCompleted: () => {
      snackSuccessMessageVar(`Successfuly removed your tax ID.`)
      formik.setFieldValue('taxIdValue', '')
    },
    onError: (error) => {
      snackErrorMessageVar(`Error removing tax ID: ${error.message}`)
    },
  })

  const formik = useFormik({
    initialValues: {
      taxIdType: possibleTaxIdTypes[0],
      taxIdValue: '',
      submit: null,
    },
    validationSchema: Yup.object({
      taxIdType: Yup.string()
        .oneOf([...possibleTaxIdTypes])
        .required(),
      taxIdValue: Yup.string().min(0).max(20),
    }),
    onSubmit: async (data) => {
      if (data.taxIdValue === '') {
        await removeTaxId({
          variables: {
            teamId: workspaceInfo.isTeam
              ? workspaceInfo.scope.variantTargetId
              : null,
          },
        })
      } else {
        await addTaxId({
          variables: {
            teamId: workspaceInfo.isTeam
              ? workspaceInfo.scope.variantTargetId
              : null,
            type: data.taxIdType as StripeTaxIdType,
            value: data.taxIdValue,
          },
        })
      }
    },
  })

  const inner = customerTaxData && (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Card>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Tax ID
          </Typography>
          <Typography variant="body2">
            If you want a tax ID to appear on your invoices, enter it here.
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              id="taxIdType"
              name="taxIdType"
              select
              SelectProps={{}}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(
                formik.touched.taxIdType && formik.errors.taxIdType
              )}
              helperText={formik.touched.taxIdType && formik.errors.taxIdType}
              value={formik.values.taxIdType}
            >
              {possibleTaxIdTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="taxIdValue"
              name="taxIdValue"
              value={formik.values.taxIdValue}
              onChange={formik.handleChange}
              size="small"
              error={Boolean(
                formik.touched.taxIdValue && formik.errors.taxIdValue
              )}
              helperText={formik.touched.taxIdValue && formik.errors.taxIdValue}
              sx={{
                flex: 1,
              }}
            />
          </Stack>
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

  if (!customerTaxData) {
    return <Skeleton height={taxIdSkeletonHeight} />
  }

  return addressStatus === 'PROVIDED' ? (
    inner ?? <></>
  ) : (
    // Paint opacity to 0.5 if address is not provided
    <Tooltip title="Please provide a billing address before adding your tax ID">
      <span>
        <Box
          sx={{
            opacity: 0.5,
            borderRadius: theme.shape.borderRadius,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {inner}
        </Box>
      </span>
    </Tooltip>
  )
}
