import { Stack, Typography, TextField, MenuItem } from '@mui/material'

import { stripeCountries } from '../stripe'

import { useBillingForm } from './use-billing-form'

type BillingAddressFormProps = {
  formik: ReturnType<typeof useBillingForm>['formik']
}

export const BillingAddressForm = ({ formik }: BillingAddressFormProps) => {
  return (
    <Stack spacing={2}>
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
          label={formik.values.country === 'US' ? 'Zip Code' : 'Postal Code'}
          value={formik.values.postal_code}
          onChange={formik.handleChange}
          size="small"
          error={Boolean(
            formik.touched.postal_code && formik.errors.postal_code
          )}
          helperText={formik.touched.postal_code && formik.errors.postal_code}
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
      {formik.errors.submit && (
        <Typography variant="body2" color="error">
          {formik.errors.submit}
        </Typography>
      )}
    </Stack>
  )
}
