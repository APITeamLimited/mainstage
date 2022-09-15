import { Stack, Typography, useTheme } from '@mui/material'

type EmptyPanelMessageProps = {
  icon: React.ReactNode
  primaryText: string
  children?: React.ReactNode
  secondaryMessages?: string[]
}

export const EmptyPanelMessage = ({
  icon,
  primaryText,
  secondaryMessages = [],
  children,
}: EmptyPanelMessageProps) => {
  const theme = useTheme()
  return (
    <Stack
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {icon}
      <Typography variant="h6" gutterBottom={secondaryMessages.length > 0}>
        <span
          style={{
            userSelect: 'none',
          }}
        >
          {primaryText}
        </span>
      </Typography>
      {secondaryMessages.map((message, index) => (
        <Typography
          key={index}
          variant="caption"
          color={theme.palette.text.secondary}
          gutterBottom={index < secondaryMessages.length - 1}
        >
          <span
            style={{
              userSelect: 'none',
            }}
          >
            {message}
          </span>
        </Typography>
      ))}
      {children}
    </Stack>
  )
}
