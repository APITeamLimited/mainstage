import { z } from 'zod'

const counterMetricsSchema = z.object({
  type: z.literal('counter'),
  values: z.object({
    count: z.number(),
    rate: z.number(),
  }),
})

export type CounterMetrics = z.infer<typeof counterMetricsSchema>

const trendMetricSchema = z.object({
  type: z.literal('trend'),
  values: z.object({
    avg: z.number(),
    max: z.number(),
    med: z.number(),
    min: z.number(),
    p90: z.number(),
    p95: z.number(),
  }),
})

export type TrendMetric = z.infer<typeof trendMetricSchema>

const rateMetricSchema = z.object({
  type: z.literal('rate'),
  values: z.object({
    fails: z.number(),
    passes: z.number(),
    rate: z.number(),
  }),
})

export type RateMetric = z.infer<typeof rateMetricSchema>

const defaultMetricSchema = z.intersection(
  z.object({
    contains: z.enum(['data', 'time', 'default']),
  }),
  z.union([counterMetricsSchema, trendMetricSchema, rateMetricSchema])
)

export type DefaultMetric = z.infer<typeof defaultMetricSchema>

export const defaultSummaryMetricsSchema = z.object({
  data_received: z.intersection(
    z.object({
      contains: z.literal('data'),
    }),
    counterMetricsSchema
  ),
  data_sent: z.intersection(
    z.object({
      contains: z.literal('data'),
    }),
    counterMetricsSchema
  ),
  http_req_blocked: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_req_connecting: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_req_duration: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_req_failed: z.intersection(
    z.object({
      contains: z.literal('default'),
    }),
    rateMetricSchema
  ),
  http_req_receiving: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_req_sending: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_req_tls_handshaking: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_req_waiting: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  http_reqs: z.intersection(
    z.object({
      contains: z.literal('default'),
    }),
    counterMetricsSchema
  ),
  iteration_duration: z.intersection(
    z.object({
      contains: z.literal('time'),
    }),
    trendMetricSchema
  ),
  iterations: z.intersection(
    z.object({
      contains: z.literal('default'),
    }),
    counterMetricsSchema
  ),
})

export type DefaultSummaryMetrics = z.infer<typeof defaultSummaryMetricsSchema>

export const innerMetricSchema = z.object({
  contains: z.enum(['data', 'time', 'default']),
  type: z.enum(['counter', 'gauge', 'rate', 'trend']),
  value: z.number(),
})

const locationMetricsSchema = z.record(innerMetricSchema)

export const globalLocationMetricsSchema = z.intersection(
  z.object({
    global: locationMetricsSchema,
  }),
  z.record(locationMetricsSchema)
)

export type LoadDistribution = z.infer<typeof globalLocationMetricsSchema>

export const metricsCombinationSchema = z.object({
  messageType: z.literal('METRICS'),
  // TODO finish
  message: globalLocationMetricsSchema,
})

export type MetricsCombination = z.infer<typeof metricsCombinationSchema>

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

export const builtInMetricsSchema = z.enum(BUILT_IN_METRICS)

export type BuiltInMetric = z.infer<typeof builtInMetricsSchema>
