import { GlobeTestMessage, StoredObject } from '..'

import { RESTRequest } from './RESTRequest'

import { BaseEntity } from '.'

type DiscreteResults =
  | { type: 'Loading'; request: RESTRequest }
  | {
      type: 'Fail'
      headers: { key: string; value: string | string[] }[]
      body: StoredObject<ArrayBuffer>
      statusCode: number
      globeTestLogs: StoredObject<GlobeTestMessage[]>
      meta: {
        responseSize: number // in bytes
        responseDuration: number // in millis
      }
      request: RESTRequest
    }
  | {
      type: 'NetworkFail'
      error: Error

      request: RESTRequest
    }
  | {
      type: 'ScriptFail'
      error: Error
    }
  | {
      type: 'Success'
      headers: { key: string; value: string | string[] }[]
      body: StoredObject<ArrayBuffer>
      statusCode: number
      meta: {
        responseSize: number // in bytes
        responseDuration: number // in millis
      }
      globeTestLogs: StoredObject<GlobeTestMessage[]>
      request: RESTRequest
    }

export interface RESTResponse extends BaseEntity {
  __typename: 'RESTResponse'
  parentId: string
  __parentTypename: 'RESTRequest'
  name: string

  discreteResults: DiscreteResults
}
