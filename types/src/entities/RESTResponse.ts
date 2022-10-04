import { Response } from 'k6/http'

import { DefaultMetrics, GlobeTestMessage, RESTRequest, StoredObject } from '..'

export type LoadingResult = {
  __subtype: 'LoadingResponse'
  options: Record<string, unknown> | null
}

export type SuccessSingleResult = {
  __subtype: 'SuccessSingleResult'
  statusCode: number
  meta: {
    responseSize: number // in bytes
    responseDuration: number // in millis
  }
  globeTestLogs: StoredObject<GlobeTestMessage[]>
  response: StoredObject<Response>
  metrics: StoredObject<DefaultMetrics>
  options: Record<string, unknown>
}

export type FailureResult = {
  __subtype: 'FailureResult'
  globeTestLogs: StoredObject<GlobeTestMessage[]>
}

export type RESTResponseBase = {
  id: string
  createdAt: Date
  updatedAt: Date | null
  __typename: 'RESTResponse'
  parentId: string
  __parentTypename: 'RESTRequest'
  // Keep name, endpoint, and method for backwards compatibility
  name: string
  endpoint: string
  method: string
  underlyingRequest: RESTRequest
  source: string
  sourceName: string
}

export type RESTResponse = RESTResponseBase &
  (LoadingResult | SuccessSingleResult | FailureResult)
