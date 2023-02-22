import { string, z } from 'zod'

import { storedObjectSchema } from '../external-entities'
import { globeTestMessageSchema } from '../test-manager'
import { globeTestResponseSchema } from '../test-manager/globe-test/http'

import { baseEntitySchema } from './base'
import { restRequestSchema } from './RESTRequest'
import {
  failureResultSchema,
  loadingResultSchema,
  successMultipleResultSchema,
  executionAgentSchema,
} from './shared'

export const successSingleResultSchema = z.object({
  __subtype: z.literal('SuccessSingleResult'),
  statusCode: z.number(),
  meta: z.object({
    responseSize: z.number(), // bytes
    responseDuration: z.number(), // ms
  }),
  testInfo: storedObjectSchema(z.array(globeTestMessageSchema)),
  response: storedObjectSchema(globeTestResponseSchema),
  options: z.record(z.unknown()),
})

export const underlyingRequestSchema = restRequestSchema.omit({
  executionScripts: true,
  description: true,
  orderingIndex: true,
})

export type UnderlyingRequest = z.infer<typeof underlyingRequestSchema>

export const restResponseSchema = z.intersection(
  baseEntitySchema.merge(
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
  ),
  z.union([
    loadingResultSchema,
    successSingleResultSchema,
    successMultipleResultSchema,
    failureResultSchema,
  ])
)

export type RESTResponse = z.infer<typeof restResponseSchema>
