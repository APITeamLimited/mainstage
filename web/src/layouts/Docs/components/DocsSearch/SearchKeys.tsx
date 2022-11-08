import { useTheme, Stack, Typography, Card } from '@mui/material'

type SearchKeyProps = {
  keys: string[]
}

export const SearchKeys = ({ keys }: SearchKeyProps) => {
  const theme = useTheme()

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {keys.map((key, index) => (
        <>
          <Card
            key={index}
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
              variant="body2"
              sx={{
                fontWeight: 'light',
                userSelect: 'none',
                color: theme.palette.grey[500],
              }}
            >
              +
            </Typography>
          )}
        </>
      ))}
    </Stack>
  )
}
