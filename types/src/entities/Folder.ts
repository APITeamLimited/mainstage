import { z } from 'zod'

import { authSchema } from './auth'
import { baseEntitySchema } from './base'
import { executionOptionsSchema } from './execution-options'
import { executionScriptSchema } from './shared'

export const folderSchema = baseEntitySchema.merge(
  z.object({
    __typename: z.literal('Folder'),
    parentId: z.string().uuid(),
    __parentTypename: z.enum(['Collection', 'Folder']),
    name: z.string(),
    orderingIndex: z.number(),
    auth: authSchema,
    description: z.string().optional(),
    executionScripts: z.array(executionScriptSchema),
    executionOptions: executionOptionsSchema.optional(),
  })
)

export type Folder = z.infer<typeof folderSchema>
