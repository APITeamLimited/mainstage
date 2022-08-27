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

export type TagType = {
  tag: string
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
      messageType: 'TAG'
      message: TagType
    }

export type GlobeTestMessage = {
  jobId: string
  time: number
} & ClientType &
  MessageCombination

type CounterMetric = {
  type: 'counter'
  values: {
    count: number
    rate: number
  }
}

type TrendMetric = {
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

type RateMetric = {
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
