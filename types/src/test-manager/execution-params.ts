import { z } from 'zod'

import { underlyingRequestSchema } from '../entities/RESTResponse'
import { isoStringRegex } from '../type-utils'

import { globeTestRequestSchema } from './globe-test'

const finalVariableSchema = z.object({
  key: z.string(),
  value: z.string(),
})

export type FinalVariable = z.infer<typeof finalVariableSchema>

const executionParamsSchema = z.object({
  id: z.string(),
  source: z.string(),
  sourceName: z.string(),
  environmentContext: z.union([
    z.object({
      variables: z.array(finalVariableSchema),
      name: z.string(),
    }),
    z.null(),
  ]),
  collectionContext: z.union([
    z.object({
      variables: z.array(finalVariableSchema),
      name: z.string(),
    }),
    z.null(),
  ]),
  finalRequest: z.union([globeTestRequestSchema, z.null()]),
  underlyingRequest: z.unknown(),
  scope: z.object({
    variant: z.union([z.literal('USER'), z.literal('TEAM')]),
    variantTargetId: z.string(),
    userId: z.string(),
  }),
  verifiedDomains: z.array(z.string()),
  createdAt: z.string().regex(isoStringRegex),
  funcModeInfo: z.union([
    z.object({
      instance100msUnitRate: z.number(),
    }),
    z.null(),
  ]),
  permittedLoadZones: z.array(z.string()).optional(),
  maxTestDurationMinutes: z.number().optional(),
  maxSimulatedUsers: z.number().optional(),
})

export type ExecutionParams = z.infer<typeof executionParamsSchema>

export const wrappedExecutionParamsSchema = executionParamsSchema
  .omit({
    id: true,
    scope: true,
    verifiedDomains: true,
    createdAt: true,
    funcModeInfo: true,
    permittedLoadZones: true,
    maxTestDurationMinutes: true,
    maxSimulatedUsers: true,
  })
  .extend({
    bearer: z.string(),
    scopeId: z.string(),
    projectId: z.string(),
    branchId: z.string(),
    testType: z.literal('rest'),
    collectionId: z.string(),
    underlyingRequest: underlyingRequestSchema,
  })

export type WrappedExecutionParams = z.infer<
  typeof wrappedExecutionParamsSchema
>
