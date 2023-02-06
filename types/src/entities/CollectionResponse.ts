import { z } from 'zod'

import { baseEntitySchema } from './base'
import {
  executionAgentSchema,
  failureResultSchema,
  loadingResultSchema,
  successMultipleResultSchema,
} from './shared'

export const collectionResponseSchema = z.intersection(
  baseEntitySchema.merge(
    z.object({
      __typename: z.literal('CollectionResponse'),
      parentId: z.string().uuid(),
      __parentTypename: z.literal('Collection'),

      source: z.string(),
      sourceName: z.string(),

      jobId: z.string().uuid(),
      createdByUserId: z.string(),

      executionAgent: executionAgentSchema,
      localJobId: z.string().uuid().optional(),
    })
  ),
  z.union([
    loadingResultSchema,
    successMultipleResultSchema,
    failureResultSchema,
  ])
)
