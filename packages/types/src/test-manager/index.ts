import { z } from 'zod'

import { isoStringRegex } from '../type-utils'

import { globeTestOptionsSchema } from './globe-test/options'

export const TEST_INFO = 'TEST_INFO' as const

export const TEST_INFO_MARK = 'TestInfoStoreReceipt' as const

const localhostFileSchema = z.object({
  fileName: z.string(),
  contents: z.string(),
  kind: z.enum([TEST_INFO]),
})

export type LocalhostFile = z.infer<typeof localhostFileSchema>

export const testManagerAuthSchema = z.object({
  bearer: z.string(),
  scopeId: z.string(),
  endpoint: z.string(),
})

export type TestManagerAuth = z.infer<typeof testManagerAuthSchema>

const statusTypeSchema = z.union([
  z.literal('PENDING'),
  z.literal('ASSIGNED'),
  z.literal('LOADING'),
  z.literal('RUNNING'),
  z.literal('FAILURE'),
  z.literal('SUCCESS'),
  z.literal('COMPLETED_SUCCESS'),
  z.literal('COMPLETED_FAILURE'),
])

export type StatusType = z.infer<typeof statusTypeSchema>

export const markTypeSchema = z.object({
  mark: z.string(),
  message: z.unknown(),
})

export type MarkType = z.infer<typeof markTypeSchema>

const messageCombinationSchema = z.union([
  z.object({
    messageType: z.literal('MESSAGE'),
    message: z.union([
      z.string(),
      z.literal('UNVERIFIED_DOMAIN_THROTTLED'),
      z.literal('MAX_CONSOLE_LOGS_REACHED'),
      z.literal('MAX_OUTPUTS_REACHED'),
    ]),
  }),
  z.object({
    messageType: z.literal('STATUS'),
    message: statusTypeSchema,
  }),
  z.object({
    messageType: z.literal('INTERVAL'),
    // Base 64 encoded
    message: z.string(),
  }),
  z.object({
    messageType: z.literal('CONSOLE'),
    // Base 64 encoded
    message: z.string(),
  }),
  z.object({
    messageType: z.literal('THREASHOLD'),
    // Base 64 encoded
    message: z.string(),
  }),
  z.object({
    messageType: z.literal('ERROR'),
    message: z.string(),
  }),
  z.object({
    messageType: z.literal('MARK'),
    message: markTypeSchema,
  }),
  z.object({
    messageType: z.literal('OPTIONS'),
    message: globeTestOptionsSchema,
  }),
  z.object({
    messageType: z.literal('COLLECTION_VARIABLES'),
    message: z.record(z.unknown()),
  }),
  z.object({
    messageType: z.literal('ENVIRONMENT_VARIABLES'),
    message: z.record(z.unknown()),
  }),
  z.object({
    messageType: z.literal('LOCALHOST_FILE'),
    message: localhostFileSchema,
  }),
])

const clientTypeSchema = z.union([
  z.object({
    senderVariant: z.literal('Orchestrator'),
    orchestratorId: z.string().uuid(),
  }),
  z.object({
    senderVariant: z.literal('Worker'),
    workerId: z.string().uuid(),
    childJobId: z.string().uuid(),
  }),
])

export const globeTestMessageSchema = z.intersection(
  z.object({
    jobId: z.string(),
    time: z.string().regex(isoStringRegex),
  }),
  z.intersection(clientTypeSchema, messageCombinationSchema)
)

export type GlobeTestMessage = z.infer<typeof globeTestMessageSchema>

const runningTestInfoSchema = z.object({
  jobId: z.string().uuid(),
  sourceName: z.string(),
  createdByUserId: z.string().uuid(),
  createdAt: z.string().regex(isoStringRegex),
  status: statusTypeSchema,
})

export type RunningTestInfo = z.infer<typeof runningTestInfoSchema>

const jobUserUpdateMessage = z.object({
  updateType: z.enum(['CANCEL']),
})

export type JobUserUpdateMessage = z.infer<typeof jobUserUpdateMessage>

export * from './utils'
export * from './globe-test'
export * from './load-zones'
export * from './test-data'
export * from './example-scripts'
