import { rawIntervalTimeSeries } from 'src/datapeak-raw/pkg/datapeak'
import { convertToRustStyles } from 'src/name-conversion'

export type DownsizingMethod =
  | {
      type: 'fixedIntervals'
      maxDataPoints?: number
    }
  | {
      type: 'movingMean'
      windowSize?: number
      maxDataPoints?: number
    }
  | {
      type: 'none'
    }

export type IntervalTimeSeries = {
  name: string
  data: [number, number][]
}

export const intervalTimeSeries = (
  testInfoId: string,
  sinkPath: string,
  downsizingMethod: DownsizingMethod
): IntervalTimeSeries =>
  rawIntervalTimeSeries(
    testInfoId,
    sinkPath,
    convertToRustStyles(downsizingMethod)
  ) as IntervalTimeSeries
