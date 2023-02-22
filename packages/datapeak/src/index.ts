import {
  rawAddStreamedData,
  rawDeleteTestData,
  rawInitTestData,
} from './datapeak-raw/pkg/datapeak'

export const initTestData = rawInitTestData as (testInfo?: Uint8Array) => string

export const deleteTestData = rawDeleteTestData

export const addStreamedData = rawAddStreamedData as (
  testInfoId: string,
  bytes: Uint8Array
) => void

export * from './wrappers'
