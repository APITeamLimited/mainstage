import { useEffect, useState } from 'react'

import { GlobeTestMessage, MetricsCombination } from '@apiteam/types/src'
import { Grid, useTheme } from '@mui/material'

import { StatsItem } from '../../../stats'

type MetricsStats = {
  totalRequests: string
  failedRequests: string
  peakRequests: string
  meanDuration: string
  meanDurationUnits: string
}

type MetricsOverviewStatsProps = {
  metrics: (GlobeTestMessage & MetricsCombination)[]
}

const calculateStats = (
  metricsMessages: MetricsOverviewStatsProps['metrics']
): MetricsStats => {
  let totalRequests = 0
  let failedRequests = 0
  let peakRequests = 0

  let meanDuration = 0
  let meanDurationCount = 0

  metricsMessages.forEach((metricsMessage) =>
    Object.entries(metricsMessage.message.global).forEach(
      ([metricName, innerContent]) => {
        if (metricName === 'http_reqs') {
          totalRequests += innerContent.value

          if (innerContent.value > peakRequests) {
            peakRequests = innerContent.value
          }
        } else if (metricName === 'http_req_failed') {
          failedRequests += innerContent.value
        } else if (metricName === 'http_req_duration') {
          meanDuration += innerContent.value
          meanDurationCount += 1
        }
      }
    )
  )

  const finalDuration =
    meanDurationCount > 0 ? meanDuration / meanDurationCount : 0

  return {
    totalRequests: totalRequests.toLocaleString(),
    failedRequests: failedRequests.toLocaleString(),
    peakRequests: peakRequests.toLocaleString(),
    meanDuration:
      finalDuration < 1000
        ? finalDuration.toFixed(0)
        : (finalDuration / 1000).toFixed(2),
    meanDurationUnits: finalDuration < 1000 ? 'ms' : 's',
  }
}

export const MetricsOverviewStats = ({
  metrics,
}: MetricsOverviewStatsProps) => {
  const theme = useTheme()

  const [stats, setStats] = useState<MetricsStats>(calculateStats(metrics))
  const [lastComputeTime, setLastComputeTime] = useState(0)

  useEffect(() => {
    // Only update stats if the last update was more than 1 second ago
    const timeNow = Date.now()

    if (timeNow - lastComputeTime > 1000) {
      setLastComputeTime(timeNow)
      setStats(calculateStats(metrics))
    } else {
      const timeToWait = 1000 - (timeNow - lastComputeTime)

      setTimeout(() => {
        setStats(calculateStats(metrics))
        setLastComputeTime(timeNow + timeToWait)
      }, timeToWait)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics])

  return (
    <Grid container spacing={2}>
      <StatsItem
        name="Total Requests"
        value={stats.totalRequests}
        units="reqs"
      />
      <StatsItem
        name="Failed Requests"
        value={stats.failedRequests}
        valueColor={theme.palette.error.main}
        units="reqs"
      />
      <StatsItem
        name="Peak Requests"
        value={stats.peakRequests}
        units="reqs / second"
      />
      <StatsItem
        name="Mean Duration"
        value={stats.meanDuration}
        units={stats.meanDurationUnits}
      />
    </Grid>
  )
}
