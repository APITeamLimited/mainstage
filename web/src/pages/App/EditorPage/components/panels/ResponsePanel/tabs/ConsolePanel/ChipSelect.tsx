import {
  Box,
  Chip,
  ChipProps,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SelectProps,
  Stack,
  TableCell,
  Theme,
  Typography,
  useTheme,
} from '@mui/material'

const getMenuStyles = (
  name: string,
  selected: readonly string[],
  theme: Theme
) => {
  return {
    fontWeight:
      selected.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  }
}

type ChipSelectProps = {
  selected: string[]
  setSelected: (selected: string[]) => void
  label: string
  options: string[]
  emptyText?: string
  size?: SelectProps['size']
  chipComponent?: (props: ChipProps) => JSX.Element
  selectSx?: SelectProps['sx']
}

export const ChipSelect = ({
  selected,
  setSelected,
  label,
  options,
  emptyText,
  size,
  chipComponent = Chip,
  selectSx,
}: ChipSelectProps) => {
  const theme = useTheme()

  const handleChange = ({
    target: { value },
  }: SelectChangeEvent<typeof selected>) => {
    // On autofill we get a stringified value.
    typeof value === 'string'
      ? setSelected(value.split(','))
      : setSelected(value)
  }

  return (
    <Select
      id={label}
      label={label}
      multiple
      displayEmpty
      value={selected}
      onChange={handleChange}
      input={<OutlinedInput />}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selected.length === 0 && (
            <InputAdornment
              position="start"
              sx={{
                height: 'auto',
              }}
            >
              {emptyText}
            </InputAdornment>
          )}
          {selected.map((value) =>
            React.createElement(chipComponent, {
              key: value,
              label: value,
              size,
              sx: {
                cursor: 'pointer',
              },
            })
          )}
        </Box>
      )}
      sx={{
        width: 200,
        '&:focus': {
          backgroundColor: 'transparent',
        },
        ...selectSx,
      }}
      size={size}
    >
      {[
        options.length === 0 && (
          <MenuItem key="disabled" disabled value="disabled">
            No options available
          </MenuItem>
        ),
        ...options.map((name) => (
          <MenuItem
            key={name}
            value={name}
            style={getMenuStyles(name, selected, theme)}
          >
            {React.createElement(chipComponent, {
              key: name,
              label: name,
              size,
              sx: {
                cursor: 'pointer',
              },
            })}
          </MenuItem>
        )),
      ]}
    </Select>
  )
}
