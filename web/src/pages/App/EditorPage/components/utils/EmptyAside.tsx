import { createElement } from 'react'

import { Stack, SvgIconProps, Typography, useTheme } from '@mui/material'

type EmptyAsideProps = {
  primaryText: string
  secondaryText: string
  icon?: React.ComponentType
  children?: React.ReactNode
}

export const EmptyAside = ({
  primaryText,
  secondaryText,
  icon,
  children,
}: EmptyAsideProps) => {
  const theme = useTheme()

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        minHeight: '200px',
        flex: 1,
      }}
      padding={2}
      spacing={2}
    >
      {icon ? (
        createElement<SvgIconProps>(icon, {
          sx: {
            width: 40,
            height: 40,
            color: theme.palette.action.disabled,
          },
        })
      ) : (
        <></>
      )}
      <Typography variant="h6" textAlign="center">
        {primaryText}
      </Typography>
      <Typography
        variant="caption"
        textAlign="center"
        color={theme.palette.text.secondary}
      >
        {secondaryText}
      </Typography>
      {children}
    </Stack>
  )
}
