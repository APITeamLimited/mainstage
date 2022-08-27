import { Response } from 'k6/http'

import { DefaultMetrics, GlobeTestMessage, StoredObject } from '..'

import { RESTRequest } from './RESTRequest'

export type SuccessDiscreteResult = {
  type: 'Success'
  statusCode: number
  meta: {
    responseSize: number // in bytes
    responseDuration: number // in millis
  }
  globeTestLogs: StoredObject<GlobeTestMessage[]>
  response: StoredObject<Response>
  metrics: StoredObject<DefaultMetrics>
}

export type FailureDiscreteResult = {
  type: 'Fail'
  statusCode: number
  meta: {
    responseSize: number // in bytes
    responseDuration: number // in millis
  }
  globeTestLogs: StoredObject<GlobeTestMessage[]>
  response: StoredObject<Response>
  metrics: StoredObject<DefaultMetrics>
}

type DiscreteResults =
  | { type: 'Loading'; request: RESTRequest }
  | FailureDiscreteResult
  | {
      type: 'NetworkFail'
      error: Error

      request: RESTRequest
    }
  | {
      type: 'ScriptFail'
      error: Error
    }
  | SuccessDiscreteResult

export type RESTResponse = {
  id: string
  createdAt: Date
  updatedAt: Date | null
  __typename: 'RESTResponse'
  parentId: string
  __parentTypename: 'RESTRequest'
  name: string
  endpoint: string
  method: string
} & DiscreteResults
