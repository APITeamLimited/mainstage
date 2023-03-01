import { z } from 'zod'

import { storedObjectSchema } from '../external-entities'
import { globeTestMessageSchema } from '../test-manager'

export const loadingResultSchema = z.object({
  __subtype: z.literal('LoadingResponse'),
  options: z.union([z.record(z.unknown()), z.null()]),
})

export const successMultipleResultSchema = z.object({
  __subtype: z.literal('SuccessMultipleResult'),
  testInfo: storedObjectSchema(z.array(globeTestMessageSchema)),
  options: z.record(z.unknown()),
  graphs: z.any(), // YMap<Graph>
  abortedEarly: z.boolean().optional(),
})

export const failureResultSchema = z.object({
  __subtype: z.literal('FailureResult'),
  testInfo: storedObjectSchema(z.array(globeTestMessageSchema)),

  // Running test may have failed so these fields may not exist
  options: z.union([z.record(z.unknown()), z.null()]),
})

export const executionAgentSchema = z.enum(['Cloud', 'Local'])
export type ExecutionAgent = z.infer<typeof executionAgentSchema>

export const executionScriptSchema = z.object({
  script: z.string(),
  language: z.literal('javascript'),
  name: z.string(),
  prettyName: z.string().optional(),
  builtIn: z.boolean().optional(),
  description: z.string().optional(),
  disabledReason: z.string().optional(),
})

export type ExecutionScript = z.infer<typeof executionScriptSchema>
