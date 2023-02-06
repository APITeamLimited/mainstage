import { z } from 'zod'

import { underlyingRequestSchema } from '../../entities/RESTResponse'
import { globeTestRequestSchema } from '../globe-test'

export const sourceScriptSchema = z.object({
  name: z.string(),
  contents: z.string(),
})

export type SourceScript = z.infer<typeof sourceScriptSchema>

export type GroupNode = {
  variant: 'group'
  id: string
  name: string
  scripts: SourceScript[]
  children: GroupNode[]
}

export const groupNodeSchema = z.intersection(
  // @ts-expect-error - zod doesn't support recursive schemas
  z.object<GroupNode>({
    variant: z.literal('group'),
    id: z.string().uuid(),
    name: z.string(),
    scripts: sourceScriptSchema.array(),
    // Needed as typescript can't infer the type of the recursive schema
    children: z.lazy(() => nodeSchema.array()),
  }),
  z.union([
    z.object({
      subVariant: z.literal('Folder'),
    }),
    z.object({
      subVariant: z.literal('Collection'),
    }),
  ])
)

export const httpRequestNodeSchema = z.intersection(
  z.object({
    variant: z.literal('httpRequest'),
    id: z.string().uuid(),
    name: z.string(),
    finalRequest: globeTestRequestSchema,
    scripts: sourceScriptSchema.array(),
  }),
  z.union([
    z.object({
      subVariant: z.literal('RESTRequest'),
      underlyingRequest: underlyingRequestSchema,
    }),
    // Add more http subVariants here
    z.object({
      subVariant: z.literal('unknown'),
    }),
  ])
)

export type HTTPRequestNode = z.infer<typeof httpRequestNodeSchema>

export const standaloneScriptNodeSchema = z.object({
  variant: z.literal('standaloneScript'),
  id: z.string().uuid(),
  name: z.string(),
  script: sourceScriptSchema,
})

export type StandaloneScriptNode = z.infer<typeof standaloneScriptNodeSchema>

export const nodeSchema = z.union([
  httpRequestNodeSchema,
  groupNodeSchema,
  standaloneScriptNodeSchema,
])

export type Node = z.infer<typeof nodeSchema>

export const testDataSchema = z.object({
  rootNode: nodeSchema,
  rootScript: sourceScriptSchema,
})

export type TestData = z.infer<typeof testDataSchema>
