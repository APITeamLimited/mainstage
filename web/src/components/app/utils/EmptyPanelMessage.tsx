import { createElement } from 'react'

import { Stack, Typography, useTheme, SvgIconProps, Box } from '@mui/material'

type EmptyPanelMessageProps = {
  icon?: React.ReactNode
  iconComponent?: React.ComponentType
  primaryText: string
  children?: React.ReactNode
  secondaryMessages?: string[]
}

export const EmptyPanelMessage = ({
  icon,
  iconComponent,
  primaryText,
  secondaryMessages = [],
  children,
}: EmptyPanelMessageProps) => {
  const theme = useTheme()

  if (iconComponent) {
    icon = createElement<SvgIconProps>(iconComponent, {
      sx: {
        marginBottom: 2,
        width: 80,
        height: 80,
        color: theme.palette.action.disabled,
      },
    })
  }

  return (
    <Stack
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        minHeight: '200px',
        flex: 1,
      }}
    >
      {icon}
      <Typography variant="h6" gutterBottom={secondaryMessages.length > 0}>
        {primaryText}
      </Typography>
      {secondaryMessages.map((message, index) => (
        <Typography
          key={index}
          variant="caption"
          color={theme.palette.text.secondary}
          gutterBottom={index < secondaryMessages.length - 1}
        >
          {message}
        </Typography>
      ))}
      {children && (
        <Box
          sx={{
            mb: 2,
          }}
        />
      )}
      {children}
    </Stack>
  )
}
