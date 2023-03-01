import { rawIntervalTimeSeries } from '../../datapeak-raw/pkg/datapeak'

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
    downsizingMethod
  ) as IntervalTimeSeries
