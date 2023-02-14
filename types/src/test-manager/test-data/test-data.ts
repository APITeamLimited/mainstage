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
  children: (HTTPRequestNode | StandaloneScriptNode | GroupNode)[]
} & (
  | {
      subVariant: 'Folder'
    }
  | {
      subVariant: 'Collection'
    }
)

// @ts-expect-error - zod doesn't support recursive schemas
export const groupNodeSchema = z.intersection<GroupNode>(
  z.object({
    variant: z.literal('group'),
    id: z.string().uuid(),
    name: z.string(),
    scripts: sourceScriptSchema.array(),
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
  z.object({
    subVariant: z.literal('RESTRequest'),
    underlyingRequest: underlyingRequestSchema,
  })
)

export type HTTPRequestNode = z.infer<typeof httpRequestNodeSchema>

export const standaloneScriptNodeSchema = z.object({
  variant: z.literal('standaloneScript'),
  id: z.string().uuid(),
  name: z.string(),
  script: sourceScriptSchema,

  // TODO - add underlying standlone script type
})

export type StandaloneScriptNode = z.infer<typeof standaloneScriptNodeSchema>

export const nodeSchema = z.union([
  httpRequestNodeSchema,
  groupNodeSchema,
  standaloneScriptNodeSchema,
])

export const compilerOptionsSchema = z.object({
  multipleScripts: z.boolean(),
})

export type CompilerOptions = z.infer<typeof compilerOptionsSchema>

export const testDataSchema = z.object({
  rootNode: nodeSchema,
  rootScript: sourceScriptSchema,
  compilerOptions: compilerOptionsSchema,
})

// Can't use inferred  type due to typescript limitations
export type Node = HTTPRequestNode | StandaloneScriptNode | GroupNode

export type TestData = {
  rootNode: Node
  rootScript: SourceScript
  compilerOptions: CompilerOptions
}
