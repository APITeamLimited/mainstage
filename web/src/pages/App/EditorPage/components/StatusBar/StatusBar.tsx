import { Stack, Paper, useTheme, Box } from '@mui/material'

import { CreditsIndicator } from './credits'
import { RunningLocalTestsIndicator } from './running-local-tests'
import { RunningCloudTestsIndicator } from './running-tests'

export const STATUS_BAR_HEIGHT = 22

export const StatusBar = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: STATUS_BAR_HEIGHT,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          height: `${STATUS_BAR_HEIGHT}px`,
          borderRadius: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            height: STATUS_BAR_HEIGHT - 1,
            maxHeight: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            paddingX: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CreditsIndicator />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <RunningLocalTestsIndicator />
            <RunningCloudTestsIndicator />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
