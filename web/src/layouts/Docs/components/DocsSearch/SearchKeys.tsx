import { useTheme, Stack, Typography, Card, Box } from '@mui/material'

type SearchKeyProps = {
  keys: string[]
}

const keySpacing = 0.5

export const SearchKeys = ({ keys }: SearchKeyProps) => {
  const theme = useTheme()

  return (
    <Stack direction="row" spacing={keySpacing} alignItems="center">
      {keys.map((key, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
          <Card
            elevation={8}
            sx={{
              paddingY: 0.25,
              paddingX: 0.5,
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              sx={{
                textTransform: 'uppercase',
                fontWeight: 'bold',
                userSelect: 'none',
                fontSize: '0.75rem',
                color: theme.palette.grey[500],
              }}
            >
              {key}
            </Typography>
          </Card>
          {index !== keys.length - 1 && (
            <Typography
              key={index + 0.5}
              variant="body2"
              sx={{
                fontWeight: 'light',
                userSelect: 'none',
                color: theme.palette.grey[500],
                marginLeft: keySpacing,
              }}
            >
              +
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  )
}
