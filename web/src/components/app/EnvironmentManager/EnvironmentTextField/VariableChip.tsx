import { Chip, Tooltip, useTheme } from '@mui/material'

type VariableChipProps = {
  variableName: string
}

export const VariableChip = ({ variableName }: VariableChipProps) => {
  const theme = useTheme()

  // Remove curly braces from start and end of variable name
  const variableNameWithoutCurlyBraces = variableName
    .replace(/^\{/, '')
    .replace(/\}$/, '')

  return (
    <Tooltip title={variableNameWithoutCurlyBraces} placement="top">
      <Chip
        label={variableNameWithoutCurlyBraces}
        variant="filled"
        color="primary"
        sx={{
          borderRadius: 1,

          '& .MuiChip-label': {
            paddingX: 0.5,
            fontWeight: 'bold',
          },
          marginX: 0.125,
          marginBottom: 0.125,
        }}
        size="small"
      />
    </Tooltip>
  )
}
