import { useMemo } from 'react'

import { Typography, Grid, useTheme } from '@mui/material'
import { getReasonPhrase } from 'http-status-codes'

import { StatsItem } from '../../../stats'

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
  const responseTime = useMemo(
    () =>
      responseTimeMilliseconds < 1000
        ? responseTimeMilliseconds.toFixed(0)
        : (responseTimeMilliseconds / 1000).toFixed(2),
    [responseTimeMilliseconds]
  )

  const responseTimeUnits = useMemo(
    () => (responseTimeMilliseconds < 1000 ? 'ms' : 's'),
    [responseTimeMilliseconds]
  )

  // Get status code color, based on if status code is in the 200s or in 400/500s
  const statusCodeColor = useMemo(
    () =>
      statusCode >= 200 && statusCode < 300
        ? theme.palette.success.main
        : statusCode < 400
        ? theme.palette.warning.main
        : theme.palette.error.main,
    [statusCode, theme]
  )

  // Format response size in either bytes , kilobytes, megabytes
  const responseSize = useMemo(
    () =>
      responseSizeBytes < 1024
        ? responseSizeBytes.toString()
        : responseSizeBytes < 1048576
        ? (responseSizeBytes / 1024).toFixed(2)
        : (responseSizeBytes / 1048576).toFixed(2),
    [responseSizeBytes]
  )

  const responseSizeUnits = useMemo(
    () =>
      responseSizeBytes < 1024
        ? 'B'
        : responseSizeBytes < 1048576
        ? 'KB'
        : 'MB',
    [responseSizeBytes]
  )

  return (
    <Grid container spacing={2}>
      <StatsItem
        name="Status"
        value={`${statusCode} ${reasonPhrase}`}
        valueColor={statusCodeColor}
      />
      <StatsItem
        name="Response Time"
        value={responseTime}
        units={responseTimeUnits}
      />
      <StatsItem
        name="Response Size"
        value={responseSize}
        units={responseSizeUnits}
      />
    </Grid>
  )
}
