import { Typography, Stack, useTheme } from '@mui/material'
import { getReasonPhrase } from 'http-status-codes'

type QuickStatsProps = {
  statusCode: number
  responseTimeMilliseconds: number
  responseSizeBytes: number
}

export const QuickSuccessSingleStats = ({
  statusCode,
  responseTimeMilliseconds,
  responseSizeBytes,
}: QuickStatsProps) => {
  const reasonPhrase = getReasonPhrase(statusCode)
  const theme = useTheme()

  // Format response time in either milliseconds or seconds
  const responseTime =
    responseTimeMilliseconds < 1000
      ? `${responseTimeMilliseconds.toFixed(0)} ms`
      : `${(responseTimeMilliseconds / 1000).toFixed(2)} s`

  // Get status code color, based on if status code is in the 200s or in 400/500s
  const statusCodeColor =
    statusCode >= 200 && statusCode < 300
      ? theme.palette.success.main
      : statusCode < 400
      ? theme.palette.warning.main
      : theme.palette.error.main

  // Format response size in either bytes , kilobytes, megabytes
  const responseSize =
    responseSizeBytes < 1024
      ? `${responseSizeBytes} B`
      : responseSizeBytes < 1048576
      ? `${(responseSizeBytes / 1024).toFixed(2)} KB`
      : `${(responseSizeBytes / 1048576).toFixed(2)} MB`

  return (
    <Stack spacing={2} direction="row">
      <Typography variant="body2" color={statusCodeColor} fontWeight={600}>
        <span
          style={{
            userSelect: 'none',
          }}
        >
          <span
            style={{
              color: theme.palette.text.primary,
            }}
          >
            Status:{' '}
          </span>
          {statusCode} {reasonPhrase}
        </span>
      </Typography>
      <Typography variant="body2" color={statusCodeColor} fontWeight={600}>
        <span
          style={{
            userSelect: 'none',
          }}
        >
          <span
            style={{
              color: theme.palette.text.primary,
            }}
          >
            Response Time:{' '}
          </span>
          {responseTime}
        </span>
      </Typography>
      <Typography variant="body2" color={statusCodeColor} fontWeight={600}>
        <span
          style={{
            userSelect: 'none',
          }}
        >
          <span
            style={{
              color: theme.palette.text.primary,
            }}
          >
            Response Size:{' '}
          </span>
          {responseSize}
        </span>
      </Typography>
    </Stack>
  )
}
