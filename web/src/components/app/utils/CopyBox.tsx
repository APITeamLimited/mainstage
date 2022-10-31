import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Stack, Paper, Typography, useTheme, Button, Box } from '@mui/material'

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
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box
        style={{
          borderTopLeftRadius: '0.25rem',
          borderBottomLeftRadius: '0.25rem',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          backgroundColor:
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[800],

          height: '60px',
          display: 'flex',
          alignItems: 'center',
          flex: 1,
        }}
        sx={{
          paddingX: 2,
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
      <Button
        onClick={handleCopy}
        variant="contained"
        color="secondary"
        sx={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          height: '60px',
        }}
      >
        <ContentCopyIcon />
      </Button>
    </Stack>
  )
}
