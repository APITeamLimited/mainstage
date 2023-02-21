import {
  rawAddStreamedData,
  rawDeleteTestData,
  rawInitTestData,
} from './datapeak-raw/pkg/datapeak'

export const initTestData = rawInitTestData as (
  test_info?: Uint8Array
) => string

export const deleteTestData = rawDeleteTestData

export const addStreamedData = rawAddStreamedData

export * from './wrappers'
