import { useMemo } from 'react'

import { Stack, Tooltip, Typography, useTheme } from '@mui/material'

import { StyledInput, StyledInputProps } from './StyledInput'

type FormStyledInputProps = StyledInputProps & {
  label?: string
  description?: string
  tooltipMessage?: string
}

/**
 * Input styled in the same way as EnvironmentTextField.
 */
export const FormStyledInput = ({
  label,
  description,
  tooltipMessage,
  ...styledInputProps
}: FormStyledInputProps) => {
  const theme = useTheme()

  const innerContent = useMemo(
    () => <StyledInput {...styledInputProps} />,
    [styledInputProps]
  )

  return (
    <Stack
      sx={{
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {label !== '' && (
        <Typography
          gutterBottom
          sx={{
            color: theme.palette.text.secondary,
          }}
        >
          <span
            style={{
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </Typography>
      )}
      {description !== '' && (
        <Typography
          variant="body2"
          color={theme.palette.grey[500]}
          marginBottom={1}
          sx={{
            userSelect: 'none',
          }}
        >
          {description}
        </Typography>
      )}
      {tooltipMessage !== '' ? (
        <Tooltip title={tooltipMessage} placement="top">
          <span>{innerContent}</span>
        </Tooltip>
      ) : (
        innerContent
      )}
    </Stack>
  )
}
