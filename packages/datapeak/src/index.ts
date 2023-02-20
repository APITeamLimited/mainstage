import {
  rawAddStreamedData,
  rawDeleteTestData,
  rawGetConsoleMessages,
  rawGetLocations,
  rawGetThresholds,
  rawInitTestData,
} from './datapeak-raw/pkg/datapeak'

export const initTestData = rawInitTestData as (
  test_info?: Uint8Array
) => string

export const deleteTestData = rawDeleteTestData

export const addStreamedData = rawAddStreamedData

export type Threshold = {
  source: string
  abortOnFail?: boolean
  delayAbortEval?: string
}

export const getThreasholds = rawGetThresholds as (
  test_info_id: string
) => Threshold[]

export type ConsoleMessage = {
  message: string
  level: string
  firstOccured: string
  lastOccured: string
  count: number
}

export const getConsoleMessages = rawGetConsoleMessages as (
  test_info_id: string
) => ConsoleMessage[]

export const getLocations = rawGetLocations as (
  test_info_id: string
) => string[]
