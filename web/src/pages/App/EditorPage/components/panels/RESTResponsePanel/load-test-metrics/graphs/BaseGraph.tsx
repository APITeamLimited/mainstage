import { useMemo } from 'react'

import type {
  GlobeTestMessage,
  MetricsCombination,
  Graph,
} from '@apiteam/types/src'
import { useTheme } from '@mui/material'
import type { ApexOptions } from 'apexcharts'

import { useApexChartsModule } from 'src/contexts/imports'

const percentToHex = (p: number) => {
  const intValue = Math.round((p / 100) * 255) // map percent to nearest integer (0 - 255)
  const hexValue = intValue.toString(16) // get hexadecimal representation
  return hexValue.padStart(2, '0').toUpperCase() // format with leading 0 and upper case characters
}

const padZero = (str: string) => {
  const zeros = new Array(2).join('0')
  return (zeros + str).slice(-2)
}

const invertColor = (hex: string) => {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  const r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16)

  // invert color components
  // pad each with zeros and return
  return (
    '#' +
    padZero((255 - r).toString(16)) +
    padZero((255 - g).toString(16)) +
    padZero((255 - b).toString(16))
  )
}

type BaseGraphProps = {
  graph: Graph
  metrics: (GlobeTestMessage & {
    orchestratorId: string
  } & MetricsCombination)[]
  height?: string | number
}

export const BaseGraph = ({
  graph,
  metrics,
  height = '100%',
}: BaseGraphProps) => {
  const { default: Chart } = useApexChartsModule()

  const theme = useTheme()

  const series = useMemo<ApexAxisChartSeries>(() => {
    // First two dataseries doesn't show all the correct values,
    // fault of globetest
    const slicedMetrics = metrics.slice(2)

    return graph.series.map((series) => {
      const baseColor =
        theme.palette.mode === 'dark' ? invertColor(series.color) : series.color

      return {
        name: `${series.metric} (${series.loadZone})`,
        type: series.kind,
        data: slicedMetrics.map(({ time, message }) => ({
          x: time,
          y: message?.[series.loadZone]?.[series.metric]?.value ?? 0,
        })),
        // If dark theme, invert colors
        color:
          series.kind === 'area'
            ? `${baseColor}${percentToHex(15)}`
            : baseColor,
      }
    })
  }, [graph, metrics, theme])

  const options = useMemo<ApexOptions>(() => {
    const options: ApexOptions = {
      chart: {
        type: 'line',
        height: height,
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        animations: {
          speed: 500,
        },
        background: 'transparent',
        fontFamily: theme.typography.fontFamily,
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          formatter: (value) => {
            const date = new Date(value)

            const hoursZeroLeft = date.getHours().toString().padStart(2, '0')
            const minutesZeroLeft = date
              .getMinutes()
              .toString()
              .padStart(2, '0')
            const secondsZeroLeft = date
              .getSeconds()
              .toString()
              .padStart(2, '0')

            return `${hoursZeroLeft}:${minutesZeroLeft}:${secondsZeroLeft}`
          },
          hideOverlappingLabels: true,
          rotate: 0,
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return value.toFixed(2)
          },
        },
      },
      theme: {
        mode: theme.palette.mode,
      },
      stroke: {
        width: 3,
        // Curve the lines
      },
      legend: {
        showForSingleSeries: true,
      },
    }
    return options
  }, [height, theme.palette.mode, theme.typography.fontFamily])

  return (
    <Chart
      options={options}
      series={series}
      type="line"
      height={height}
      style={{ width: '100%' }}
    />
  )
}
