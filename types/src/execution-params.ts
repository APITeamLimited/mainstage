import { z } from 'zod'

import { testDataSchema } from './test-manager'
import { isoStringRegex } from './type-utils'

const finalVariableSchema = z.object({
  key: z.string(),
  value: z.string(),
})

export type FinalVariable = z.infer<typeof finalVariableSchema>

const executionParamsSchema = z.object({
  id: z.string(),
  createdAt: z.string().regex(isoStringRegex),

  // Created by the user
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
  scope: z.object({
    variant: z.union([z.literal('USER'), z.literal('TEAM')]),
    variantTargetId: z.string(),
    userId: z.string(),
  }),
  verifiedDomains: z.array(z.string()),
  testData: testDataSchema,

  // Internal APITeam information
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
    collectionId: z.string(),
  })

export type WrappedExecutionParams = z.infer<
  typeof wrappedExecutionParamsSchema
>
