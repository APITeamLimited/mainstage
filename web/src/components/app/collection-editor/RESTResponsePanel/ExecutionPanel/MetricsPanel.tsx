import { useEffect } from 'react'

import { CounterMetric, DefaultMetrics } from '@apiteam/types'
import { Stack, Typography } from '@mui/material'

type MetricsPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  metrics: DefaultMetrics
}

export const MetricsPanel = ({ setActionArea, metrics }: MetricsPanelProps) => {
  useEffect(() => {
    setActionArea(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing={2}>
      {Object.entries(metrics).map(([name, value], index) => {
        // Convert name from snake case to title case
        const formattedName = name
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        return (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="space-between"
            key={index}
          >
            <Typography key={index} variant="body1">
              {formattedName}:
            </Typography>
            {value.type === 'counter' && (
              <InternationalisedCount
                values={value.values}
                contains={value.contains}
              />
            )}
            {value.type === 'trend' && (
              <InternationalisedTrend
                values={value.values}
                contains={value.contains}
              />
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}

const InternationalisedCount = ({
  values: { count, rate },
  contains,
}: {
  values: {
    count: number
    rate: number
  }
  contains: 'data' | 'default' | 'time'
}) => {
  const unitType = contains === 'data' ? 'B' : contains === 'time' ? 's' : ''
  // SI prefix based on international standard
  const foramtter = Intl.NumberFormat('en', {
    notation: 'compact',
  })
  const formattedCount = foramtter.format(count)
  const formattedRate = foramtter.format(rate)

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2">
        <strong>Total </strong>
        {formattedCount}
        {unitType}
      </Typography>
      <Typography variant="body2">
        <strong>Rate </strong>
        {formattedRate}
        {unitType}/s
      </Typography>
    </Stack>
  )
}

const InternationalisedTrend = ({
  values: { avg, max, med, min, p90, p95 },
  contains,
}: {
  values: {
    avg: number
    max: number
    med: number
    min: number
    p90: number
    p95: number
  }
  contains: 'data' | 'default' | 'time'
}) => {
  const unitType = contains === 'data' ? 'B' : contains === 'time' ? 's' : ''

  if (unitType === 's') {
    avg = avg / 1000
    max = max / 1000
    med = med / 1000
    min = min / 1000
    p90 = p90 / 1000
    p95 = p95 / 1000
  }

  // Round all to 2 significant figures and convert to si
  const formattedAvg = avg.toPrecision(2)
  const formattedMax = max.toPrecision(2)
  const formattedMed = med.toPrecision(2)
  const formattedMin = min.toPrecision(2)
  const formattedP90 = p90.toPrecision(2)
  const formattedP95 = p95.toPrecision(2)

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2">
        <strong>Min </strong>
        {formattedMin}
        {isNaN(min) ? '' : unitType}
      </Typography>
      <Typography variant="body2">
        <strong>Max </strong>
        {formattedMax}
        {isNaN(max) ? '' : unitType}
      </Typography>
      <Typography variant="body2">
        <strong>Avg </strong>
        {formattedAvg}
        {isNaN(avg) ? '' : unitType}
      </Typography>
      <Typography variant="body2">
        <strong>Med </strong>
        {formattedMed}
        {isNaN(med) ? '' : unitType}
      </Typography>
      <Typography variant="body2">
        <strong>P90 </strong>
        {formattedP90}
        {isNaN(p90) ? '' : unitType}
      </Typography>
      <Typography variant="body2">
        <strong>P95 </strong>
        {formattedP95}
        {isNaN(p95) ? '' : unitType}
      </Typography>
    </Stack>
  )
}
