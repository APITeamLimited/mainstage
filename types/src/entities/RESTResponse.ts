import { Response } from 'k6/http'
import type { Map as YMap } from 'yjs'

import { DefaultMetrics, GlobeTestMessage, RESTRequest, StoredObject } from '..'
import { Graph } from '../graph'

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

export type SuccessMultipleResult = {
  __subtype: 'SuccessMultipleResult'
  globeTestLogs: StoredObject<GlobeTestMessage[]>
  metrics: StoredObject<DefaultMetrics>
  options: Record<string, unknown>
  graphs?: YMap<Graph>
}

export type FailureResult = {
  __subtype: 'FailureResult'
  globeTestLogs: StoredObject<GlobeTestMessage[]>

  // Running test may have failed so these fields may exist
  metrics: StoredObject<DefaultMetrics> | null
  options: Record<string, unknown> | null
}

export type RESTResponseBase = {
  __typename: 'RESTResponse'
  id: string
  createdAt: Date
  updatedAt: Date | null
  parentId: string
  __parentTypename: 'RESTRequest'
  underlyingRequest: RESTRequest
  source: string
  sourceName: string
  jobId: string
  createdByUserId: string

  // Keep name, endpoint, and method for backwards compatibility
  name: string
  endpoint: string
  method: string
}

export type RESTResponse = RESTResponseBase &
  (LoadingResult | SuccessSingleResult | FailureResult)
