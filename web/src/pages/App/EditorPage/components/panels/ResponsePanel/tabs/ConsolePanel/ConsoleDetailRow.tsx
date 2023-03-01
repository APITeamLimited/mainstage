import { useMemo } from 'react'

import type { ConsoleMessage } from '@apiteam/datapeak'
import {
  Chip,
  FormLabel,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

type ConsoleDetailRowProps = {
  consoleMessage: ConsoleMessage
  namespace: string
}

export const ConsoleDetailRow = ({
  consoleMessage,
  namespace,
}: ConsoleDetailRowProps) => {
  const theme = useTheme()

  const countNodes = useMemo(() => {
    const countData = Object.entries(consoleMessage.count).map(
      ([location, count]) => ({
        location,
        count,
      })
    )

    // Sort so that global count is first
    countData.sort((a, b) => {
      if (a.location === 'global') {
        return -1
      }

      if (b.location === 'global') {
        return 1
      }

      return 0
    })

    return countData.map(({ location, count }) => (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          marginRight: 2,
          marginBottom: 2,
        }}
        key={location}
      >
        <Chip size="small" label={location} />
        <Typography>{count}</Typography>
      </Stack>
    ))
  }, [consoleMessage.count])

  const firstOccurredDate = useMemo(
    () => new Date(consoleMessage.firstOccurred),
    [consoleMessage.firstOccurred]
  )

  const lastOccurredDate = useMemo(
    () => new Date(consoleMessage.lastOccurred),
    [consoleMessage.lastOccurred]
  )

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between">
      {/* <Box sx={{ width: '50%', height: '200px' }}>
        <MonacoEditor
          value={consoleMessage.message}
          readOnly
          language="json"
          namespace={namespace}
          height="100%"
          lineNumbers="off"
        />
      </Box> */}
      <Stack spacing={2} sx={{ width: '50%' }}>
        <FormLabel>Locations</FormLabel>
        <Grid container>{countNodes}</Grid>
      </Stack>
      <Stack spacing={2} sx={{ width: '50%' }}>
        <FormLabel>First Occurred</FormLabel>
        <Typography>
          {firstOccurredDate.toLocaleDateString()} -{' '}
          {firstOccurredDate.toLocaleTimeString()}
        </Typography>
        <FormLabel>Last Occurred</FormLabel>
        <Typography>
          {lastOccurredDate.toLocaleDateString()} -{' '}
          {lastOccurredDate.toLocaleTimeString()}
        </Typography>
      </Stack>
    </Stack>
  )
}
