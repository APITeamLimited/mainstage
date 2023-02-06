import { z } from 'zod'

import { authSchema } from './auth'
import { baseEntitySchema } from './base'
import { executionScriptSchema } from './shared'

export const collectionSchema = baseEntitySchema.merge(
  z.object({
    __typename: z.literal('Collection'),
    parentId: z.string().uuid(),
    __parentTypename: z.literal('Project'),
    name: z.string(),
    orderingIndex: z.number(),
    auth: authSchema,
    description: z.string().optional(),
    executionScripts: z.array(executionScriptSchema),
  })
)

export type Collection = z.infer<typeof collectionSchema>
