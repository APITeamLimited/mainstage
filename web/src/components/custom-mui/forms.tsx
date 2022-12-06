import { FormControlLabel, FormControlLabelProps, Radio } from '@mui/material'

import {
  EnvironmentTextField,
  EnvironmentTextFieldProps,
} from '../app/EnvironmentManager'

export const FormEnvironmentTextField = (props: EnvironmentTextFieldProps) => (
  <div style={{ width: '100%' }}>
    <EnvironmentTextField {...props} />
  </div>
)

export const CustomFormControlLabel = (
  props: Omit<FormControlLabelProps, 'control'>
) => (
  <FormControlLabel
    {...props}
    control={<Radio />}
    sx={{
      '& .MuiFormControlLabel-label': {
        userSelect: 'none',
      },
      ...props.sx,
    }}
  />
)
