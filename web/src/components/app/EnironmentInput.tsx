import { Chip, ChipProps } from '@mui/material'
import { MarkedInput, Option } from 'rc-marked-input'

type EnvironmentInputProps = {
  enabled?: boolean
  value?: string
  onChange?: (value: string) => void
}

export const EnvironmentInput = ({
  enabled = true,
  value = '',
  onChange,
}: EnvironmentInputProps) => {
  const innerOptions = enabled ? (
    <>
      <Option<ChipProps>
        markup="{__value__}"
        initializer={(label) => ({
          label,
          variant: 'outlined',
          size: 'small',
        })}
      />
      <Option<ChipProps>
        markup="@[__value__](common:__id__)"
        initializer={(label, id) => ({ label, size: 'small' })}
      />
    </>
  ) : (
    <></>
  )

  return (
    <MarkedInput
      Mark={Chip}
      value={value}
      onChange={(val: string) => onChange?.(val)}
    >
      {innerOptions}
    </MarkedInput>
  )
}
