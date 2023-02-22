import { z } from 'zod'

import { AVAILABLE_LOAD_ZONES } from './test-manager/load-zones'
import { hexColorRegex, isoStringRegex } from './type-utils'

export const GRAPH_LOAD_ZONES = [
  ...AVAILABLE_LOAD_ZONES,
  'localhost',
  'global',
] as const

export const graphLoadZoneSchema = z.enum(GRAPH_LOAD_ZONES)

export const graphSeriesSchema = z.object({
  loadZone: graphLoadZoneSchema,
  color: z.string().regex(hexColorRegex),
  kind: z.enum(['line', 'area', 'column']),
  // TODO: Add a better type
  metric: z.string(),
})

export type GraphSeries = z.infer<typeof graphSeriesSchema>

export const graphConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  series: z.array(graphSeriesSchema),
  desiredWidth: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
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
