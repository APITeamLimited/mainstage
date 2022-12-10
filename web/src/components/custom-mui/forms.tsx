import {
  FormControlLabel,
  FormControlLabelProps,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from '@mui/material'

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

type CustomFormRadioGroupProps = {
  label: string
  name: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: { label: string; value: string }[]
}

export const CustomFormRadioGroup = ({
  label,
  name,
  value,
  onChange,
  options,
}: CustomFormRadioGroupProps) => (
  <div>
    <FormLabel>{label}</FormLabel>
    <RadioGroup name={name} value={value} onChange={onChange} row>
      {options.map(({ label, value }) => (
        <CustomFormControlLabel key={value} value={value} label={label} />
      ))}
    </RadioGroup>
  </div>
)

type CustomFormSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}

export const CustomFormSelect = ({
  label,
  value,
  onChange,
  options,
}: CustomFormSelectProps) => (
  <Stack spacing={0.5}>
    <FormLabel
      sx={{
        marginBottom: 1,
      }}
    >
      {label}
    </FormLabel>
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as string)}
      size="small"
      fullWidth
    >
      {options.map(({ label, value }, index) => (
        <MenuItem key={index} value={value}>
          {label}
        </MenuItem>
      ))}
    </Select>
  </Stack>
)
