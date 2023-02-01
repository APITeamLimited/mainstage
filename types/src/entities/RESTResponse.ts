import { string, z } from 'zod'

import { storedObjectSchema } from '../external-entities'
import { globeTestMessageSchema } from '../test-manager'
import { globeTestResponseSchema } from '../test-manager/globe-test/http'
import { defaultSummaryMetricsSchema } from '../test-manager/metrics'

import { baseEntitySchema } from './base'
import { restRequestSchema } from './RESTRequest'

export const loadingResultSchema = z.object({
  __subtype: z.literal('LoadingResponse'),
  options: z.union([z.record(z.unknown()), z.null()]),
})

export type LoadingResult = z.infer<typeof loadingResultSchema>

export const successSingleResultSchema = z.object({
  __subtype: z.literal('SuccessSingleResult'),
  statusCode: z.number(),
  meta: z.object({
    responseSize: z.number(), // bytes
    responseDuration: z.number(), // ms
  }),
  globeTestLogs: storedObjectSchema(z.array(globeTestMessageSchema)),
  metrics: storedObjectSchema(defaultSummaryMetricsSchema),
  response: storedObjectSchema(globeTestResponseSchema),
  options: z.record(z.unknown()),
})

export type SuccessSingleResult = z.infer<typeof successSingleResultSchema>

export const successMultipleResultSchema = z.object({
  __subtype: z.literal('SuccessMultipleResult'),
  globeTestLogs: storedObjectSchema(z.array(globeTestMessageSchema)),
  metrics: storedObjectSchema(defaultSummaryMetricsSchema),
  options: z.record(z.unknown()),
  graphs: z.any(), // YMap<Graph>
})

export const failureResultSchema = z.object({
  __subtype: z.literal('FailureResult'),
  globeTestLogs: storedObjectSchema(z.array(globeTestMessageSchema)),

  // Running test may have failed so these fields may exist
  metrics: z.union([storedObjectSchema(defaultSummaryMetricsSchema), z.null()]),
  options: z.union([z.record(z.unknown()), z.null()]),
})

export type FailureResult = z.infer<typeof failureResultSchema>

export const underlyingRequestSchema = restRequestSchema.omit({
  executionScripts: true,
  description: true,
  orderingIndex: true,
})

export type UnderlyingRequest = z.infer<typeof underlyingRequestSchema>

const executionAgentSchema = z.enum(['Cloud', 'Local'])
export type ExecutionAgent = z.infer<typeof executionAgentSchema>

export const restResponseBaseSchema = baseEntitySchema.merge(
  z.object({
    __typename: z.literal('RESTResponse'),
    parentId: z.string().uuid(),
    __parentTypename: z.literal('RESTRequest'),
    underlyingRequest: underlyingRequestSchema,
    source: z.string(),
    sourceName: z.string(),
    jobId: z.string().uuid(),
    createdByUserId: string(),

    // Keep name, endpoint, and method for backwards compatibility
    name: z.string(),
    endpoint: z.string(),
    method: z.string(),
    executionAgent: executionAgentSchema,
    localJobId: z.string().uuid().optional(),
  })
)

export type RESTResponseBase = z.infer<typeof restResponseBaseSchema>

export const restResponseSchema = z.intersection(
  restResponseBaseSchema,
  z.union([
    loadingResultSchema,
    successSingleResultSchema,
    successMultipleResultSchema,
    failureResultSchema,
  ])
)

export type RESTResponse = z.infer<typeof restResponseSchema>

// export type RESTResponse = RESTResponseBase &
//   (LoadingResult | SuccessSingleResult | FailureResult)
