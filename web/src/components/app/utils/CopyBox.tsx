import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Stack, Card, Typography, useTheme, Button, Box } from '@mui/material'

type CopyBoxProps = {
  text: string
  onCopy?: () => void
}

export const CopyBox = ({ text, onCopy }: CopyBoxProps) => {
  const theme = useTheme()

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    onCopy?.()
  }

  return (
    <Card
      sx={{
        bgcolor:
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800],
      }}
      elevation={0}
    >
      <Stack direction="row" justifyContent="space-between">
        <Box
          sx={{
            mx: 2,
            py: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              // Break over new lines
              wordBreak: 'break-all',
            }}
          >
            {text}
          </Typography>
        </Box>
        <Button onClick={handleCopy} variant="contained" color="secondary">
          <ContentCopyIcon />
        </Button>
      </Stack>
    </Card>
  )
}
