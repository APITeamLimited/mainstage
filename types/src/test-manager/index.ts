import { z } from 'zod'

import { underlyingRequestSchema } from '../entities/RESTResponse'
import { isoStringRegex } from '../type-utils'

import { globeTestRequestSchema } from './globe-test/http'
import { globeTestOptionsSchema } from './globe-test/options'
import { metricsCombinationSchema } from './metrics'

export const GLOBETEST_LOGS = 'GLOBETEST_LOGS' as const
export const GLOBETEST_METRICS = 'GLOBETEST_METRICS' as const

export const GLOBETEST_LOGS_MARK = 'GlobeTestLogsStoreReceipt' as const
export const METRICS_MARK = 'MetricsStoreReceipt' as const

const localhostFileSchema = z.object({
  fileName: z.string(),
  contents: z.string(),
  kind: z.enum([GLOBETEST_LOGS, GLOBETEST_METRICS]),
})

export type LocalhostFile = z.infer<typeof localhostFileSchema>

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
    message: z.union([z.string(), z.literal('UNVERIFIED_DOMAIN_THROTTLED')]),
  }),
  z.object({
    messageType: z.literal('CONSOLE'),
    message: z.record(z.unknown()),
  }),
  z.object({
    messageType: z.literal('STATUS'),
    message: statusTypeSchema,
  }),
  z.object({
    messageType: z.literal('SUMMARY_METRICS'),
    message: z.record(z.unknown()),
  }),
  // METRICS
  metricsCombinationSchema,
  z.object({
    messageType: z.literal('ERROR'),
    message: z.string(),
  }),
  z.object({
    messageType: z.literal('DEBUG'),
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
    messageType: z.literal('JOB_INFO'),
    message: z.object({
      id: z.string(),
      options: globeTestOptionsSchema.or(z.null()),
      scope: z.object({
        variant: z.union([z.literal('USER'), z.literal('TEAM')]),
        variantTargetId: z.string().uuid(),
      }),
      source: z.string(),
      sourceName: z.string(),
    }),
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

const resolvedVariable = z.union([
  z.object({
    sourceName: z.string(),
    sourceTypename: z.enum(['Collection', 'Environment']),
    value: z.string(),
  }),
  z.null(),
])

export type ResolvedVariable = z.infer<typeof resolvedVariable>

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

export { BUILT_IN_METRICS } from './metrics'
export type { MetricsCombination } from './metrics'
export * from './utils'
export * from './globe-test'

export * from './load-zones'
