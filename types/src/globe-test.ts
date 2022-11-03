import type { VerifiedDomain } from '@prisma/client'
import type { RequestBody, ResponseType, RefinedParams } from 'k6/http'
import { Options as K6Options } from 'k6/options'

import { RESTRequest } from './entities'
import { GraphSeries } from './graph'

export interface K6RequestConfig<RT extends ResponseType | undefined> {
  method: string
  url: string
  body?: RequestBody | null
  params?: RefinedParams<RT> | null
}

export type FinalVariable = {
  key: string
  value: string
}

/* Parameters that are passed to the globe-test orchestrator */
export type ExecutionParams = {
  id: string
  source: string
  sourceName: string
  environmentContext: {
    variables: FinalVariable[]
    name: string
  } | null
  collectionContext: {
    variables: FinalVariable[]
    name: string
  } | null
  finalRequest: K6RequestConfig<undefined> | null
  underlyingRequest: RESTRequest | null
  scope: {
    variant: 'USER' | 'TEAM'
    variantTargetId: string
  }
  verifiedDomains: string[]
}

/* Wrapper around the execution params that servers as user arguments to the
globe-test agent */
export type WrappedExecutionParams = Omit<
  ExecutionParams,
  'id' | 'scope' | 'verifiedDomains'
> & {
  bearer: string
  scopeId: string
  projectId: string
  branchId: string
} & {
  testType: 'rest'
  collectionId: string
  underlyingRequest: RESTRequest
}

type ClientType =
  | {
      orchestratorId: string
    }
  | {
      workerId: string
      childJobId: string
    }

export type StatusType =
  | 'PENDING'
  | 'ASSIGNED'
  | 'LOADING'
  | 'RUNNING'
  | 'FAILURE'
  | 'SUCCESS'
  | 'COMPLETED_SUCCESS'
  | 'COMPLETED_FAILURE'

export type MarkType = {
  mark: string
  message: unknown
}

type InnerMetric = {
  contains: 'data' | 'time'
  type: 'rate' | 'counter' | 'gauge' | 'trend'
  value: number
}

export type MetricsCombination = {
  messageType: 'METRICS'
  message: LoadDistribution
}

export const BUILT_IN_METRICS = [
  'data_received',
  'data_sent',
  'http_req_blocked',
  'http_req_connecting',
  'http_req_duration',
  'http_req_failed',
  'http_req_receiving',
  'http_req_sending',
  'http_req_tls_handshaking',
  'http_req_waiting',
  'http_reqs',
  'iteration_duration',
  'iterations',
  'vus',
  'vus_max',
] as const

type MessageCombination =
  | {
      messageType: 'MESSAGE'
      message: 'UNVERIFIED_DOMAIN_THROTTLED' | string
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
  | MetricsCombination
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
  | {
      messageType: 'COLLECTION_VARIABLES'
      message: Record<string, string>
    }
  | {
      messageType: 'ENVIRONMENT_VARIABLES'
      message: Record<string, string>
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

type LoadDistribution = {
  global: Record<string, InnerMetric>
  [loadZone: string]: Record<string, InnerMetric>
}

type GraphConfig = {
  name: string
  description?: string
  series: GraphSeries[]
  desiredWidth: number
}

export type GlobeTestOptions = Omit<K6Options, 'noUsageReport' | 'linger'> & {
  executionMode: 'httpSingle' | 'httpMultiple'
  loadDistribution: LoadDistribution
  outputConfig: {
    graphs: GraphConfig[]
  } | null
}

export type RunningTestInfo = {
  jobId: string
  sourceName: string
  createdByUserId: string
  createdAt: string
  status: StatusType
}

export type JobUserUpdateMessage = {
  updateType: 'CANCEL'
}
