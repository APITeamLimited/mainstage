import type { RequestBody, ResponseType, RefinedParams } from 'k6/http'
import { Options as K6Options } from 'k6/options'

import { RESTRequest } from './entities'

export interface K6RequestConfig<RT extends ResponseType | undefined> {
  method: string
  url: string
  body?: RequestBody | null
  params?: RefinedParams<RT> | null
}

/* Parameters that are passed to the globe-test orchestrator */
export type ExecutionParams = {
  id: string
  source: string
  sourceName: string
  scopeId: string
  environmentContext: {
    variables: {
      key: string
      value: string
    }[]
  } | null
  collectionContext: {
    variables: {
      key: string
      value: string
    }[]
  } | null
  restRequest: K6RequestConfig<undefined> | null
}

/* Wrapper around the execution params that servers as arguments to the node
globe-test agent */
export type WrappedExecutionParams = Omit<ExecutionParams, 'id'> & {
  bearer: string
  projectId: string
  branchId: string
} & {
  testType: 'rest'
  collectionId: string
  underlyingRequest: RESTRequest
}

type ClientType =
  | {
      orchestratorClient: string
    }
  | {
      workerClient: string
    }

export type StatusType =
  | 'PENDING'
  | 'ASSIGNED'
  | 'LOADING'
  | 'RUNNING'
  | 'FAILED'
  | 'SUCCESS'
  | 'COMPLETED_SUCCESS'
  | 'COMPLETED_FAILED'

export type MarkType = {
  mark: string
  message: unknown
}

type MessageCombination =
  | {
      messageType: 'MESSAGE'
      message: string
    }
  | {
      messageType: 'CONSOLE'
      message: Record<string, unknown>
    }
  | {
      messageType: 'STATUS'
      message: StatusType
    }
  | {
      messageType: 'SUMMARY_METRICS'
      message: Record<string, unknown>
    }
  | {
      messageType: 'METRICS'
      message: Record<string, unknown>
    }
  | {
      messageType: 'ERROR'
      message: string
    }
  | {
      messageType: 'DEBUG'
      message: string
    }
  | {
      messageType: 'MARK'
      message: MarkType
    }
  | {
      messageType: 'OPTIONS'
      message: GlobeTestOptions
    }
  | {
      messageType: 'JOB_INFO'
      message: {
        id: string
        options: GlobeTestOptions
        scopeId: string
        source: string
        sourceName: string
        status: StatusType
      }
    }

export type GlobeTestMessage = {
  jobId: string
  time: string
} & ClientType &
  MessageCombination

export type CounterMetric = {
  type: 'counter'
  values: {
    count: number
    rate: number
  }
}

export type TrendMetric = {
  type: 'trend'
  values: {
    avg: number
    max: number
    med: number
    min: number
    p90: number
    p95: number
  }
}

export type RateMetric = {
  type: 'rate'
  values: {
    fails: number
    passes: number
    rate: number
  }
}

export type DefaultMetric = {
  contains: 'data' | 'time' | 'default'
} & (CounterMetric | TrendMetric | RateMetric)

export type DefaultMetrics = {
  data_received: { contains: 'data' } & CounterMetric
  data_sent: { contains: 'data' } & CounterMetric
  http_req_blocked: { contains: 'time' } & TrendMetric
  http_req_connecting: { contains: 'time' } & TrendMetric
  http_req_duration: { contains: 'time' } & TrendMetric
  http_req_failed: { contains: 'default' } & RateMetric
  http_req_receiving: { contains: 'time' } & TrendMetric
  http_req_sending: { contains: 'time' } & TrendMetric
  http_req_tls_handshaking: { contains: 'time' } & TrendMetric
  http_req_waiting: { contains: 'time' } & TrendMetric
  http_reqs: { contains: 'default' } & CounterMetric
  iteration_duration: { contains: 'time' } & TrendMetric
  iterations: { contains: 'default' } & CounterMetric
}

export type ResolvedVariable = {
  sourceName: string
  sourceTypename: 'Environment' | 'Collection'
  value: string
} | null

export type GlobeTestOptions = Omit<K6Options, 'noUsageReport' | 'linger'> & {
  executionMode: 'rest_single' | 'rest_multiple'
}
