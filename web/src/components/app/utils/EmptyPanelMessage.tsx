import { Stack, Typography, useTheme } from '@mui/material'

type EmptyPanelMessageProps = {
  icon: React.ReactNode
  primaryText: string
  secondaryMessages?: string[]
}

export const EmptyPanelMessage = ({
  icon,
  primaryText,
  secondaryMessages = [],
}: EmptyPanelMessageProps) => {
  const theme = useTheme()
  return (
    <Stack
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingY: 6,
        overflowY: 'auto',
        overflowX: 'hidden',
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
    </Stack>
  )
}
