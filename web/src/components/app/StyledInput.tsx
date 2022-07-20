import { Input, SxProps, Theme } from '@mui/material'

type StyledInputProps = {
  value: string
  onChangeValue?: (value: string) => void
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  sx?: SxProps<Theme>
}

/**
 * Input styled in the same way as EnvironmentTextField.
 */
export const StyledInput = ({
  value,
  onChange,
  onChangeValue,
  sx,
}: StyledInputProps) => {
  return (
    <Input
      value={value}
      onChange={(e) => {
        onChange?.(e)
        onChangeValue?.(e.target.value)
      }}
      sx={{
        height: '40px',
        width: '100%',
        border: 'none',
        ...sx,
      }}
    />
  )
}
