import {
  Button,
  Paper,
  Typography,
  Box,
  Stack,
  IconButton,
  useTheme,
} from '@mui/material'

import { OverviewType } from './ProjectOverview'

type OverviewItemProps = {
  item: OverviewType
}

export function OverviewItem({ item }: OverviewItemProps) {
  const theme = useTheme()

  return (
    <Paper
      elevation={2}
      sx={{
        marginRight: 2,
        marginBottom: 2,
        minWidth: 130,
        minHeight: 150,
      }}
    >
      <Button
        sx={{
          m: 0,
          p: 2,
          width: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <Stack
            spacing={2}
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {item.name}
              </Typography>
              <IconButton>b</IconButton>
            </Stack>
            <Typography
              sx={{
                textTransform: 'lowercase',
                color: theme.palette.text.secondary,
              }}
            >
              {item.__typename}
            </Typography>
          </Stack>
        </Box>
      </Button>
    </Paper>
  )
}
