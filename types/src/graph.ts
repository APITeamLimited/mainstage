import { z } from 'zod'

import { builtInMetricsSchema } from './test-manager/metrics'
import { hexColorRegex, isoStringRegex } from './type-utils'

export const AVAILABLE_LOAD_ZONES = ['global', 'uk-south', 'us-west'] as const

export const availableLoadZonesSchema = z.enum(AVAILABLE_LOAD_ZONES)

export type AvailableLoadZones = z.infer<typeof availableLoadZonesSchema>

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
