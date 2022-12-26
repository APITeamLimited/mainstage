import { z } from 'zod'

import { builtInMetricsSchema } from './test-manager/metrics'
import { hexColorRegex, isoStringRegex } from './type-utils'

export const AVAILABLE_LOAD_ZONES = [
  'asia-east2',
  'asia-northeast3',
  'asia-southeast1',
  'asia-southeast2',
  'asia-south1',
  'asia-south2',
  'australia-southeast1',
  'australia-southeast2',
  'europe-central2',
  'europe-west2',
  'europe-west3',
  'europe-west6',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us-west2',
  'us-west3',
  'us-west4',
] as const

export const availableLoadZonesSchema = z.enum(AVAILABLE_LOAD_ZONES)

export type AvailableLoadZone = z.infer<typeof availableLoadZonesSchema>

export const graphSeriesSchema = z.object({
  loadZone: availableLoadZonesSchema,
  color: z.string().regex(hexColorRegex),
  kind: z.enum(['line', 'area', 'column']),
  metric: builtInMetricsSchema,
})

export type GraphSeries = z.infer<typeof graphSeriesSchema>

export const graphConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  series: z.array(graphSeriesSchema),
  desiredWidth: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

export type GraphConfig = z.infer<typeof graphConfigSchema>

export const graphSchema = z.intersection(
  z.object({
    __typename: z.literal('Graph'),
    id: z.string().regex(isoStringRegex),
  }),
  graphConfigSchema
)

export type Graph = z.infer<typeof graphSchema>
