import {
  Stack,
  Divider,
  Typography,
  Button,
  Box,
  Skeleton,
  Card,
} from '@mui/material'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useBillingAddress } from '../BillingProvider'

import { BillingAddressForm } from './BillingAddressForm'
import { useBillingForm } from './use-billing-form'

const billingAddressSkeletonHeight = 300

export const BillingAddressCard = () => {
  const addressInfo = useBillingAddress()
  const workspaceInfo = useWorkspaceInfo()
  const { formik } = useBillingForm()

  return addressInfo ? (
    <Card>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={2} p={2}>
          <Typography variant="h6" fontWeight="bold">
            Billing Address
          </Typography>
          <Typography variant="body2">
            Enter the billing address for your{' '}
            {workspaceInfo.isTeam ? 'team' : 'account'}. This will be used for
            all billing and invoicing. This can be personal or business.
          </Typography>
          <Divider />
          <BillingAddressForm formik={formik} />
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
      </form>
    </Card>
  ) : (
    <Skeleton height={billingAddressSkeletonHeight} />
  )
}
