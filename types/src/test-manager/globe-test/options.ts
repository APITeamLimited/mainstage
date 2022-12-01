import { z } from 'zod'

import { graphConfigSchema } from '../../graph'

import { cipherSuiteSchema } from './http'

const collectorOptionsSchema = z.record(z.any())

// Add definitions here if required in the future

const scenarioSchema = z.unknown()

const stagesSchema = z.unknown()

const thresholdsSchema = z.unknown()

export const certificateSchema = z.unknown()

// This is primarily concerned with options output validation from GlobeTest, not
// as an input schema for the user
export const originalGlobeTestOptionsSchema = z.object({
  batch: z.number().or(z.null()).optional(),
  batchPerHost: z.number().or(z.null()).optional(),
  blackListIPs: z.array(z.string()).or(z.null()).optional(),
  blockHostnames: z.array(z.string()).or(z.null()).optional(),
  discardResponseBodies: z.boolean().or(z.null()).optional(),
  dns: z
    .object({
      ttl: z.string().or(z.null()),
      select: z.enum(['first', 'random', 'roundRobin']).or(z.null()),
      policy: z
        .enum(['preferIPv4', 'preferIPv6', 'onlyIPv4', 'onlyIPv6', 'any'])
        .or(z.null()),
    })
    .or(z.null())
    .optional(),
  duration: z.string().or(z.null()).optional(),
  executionSegment: z.string().or(z.null()).optional(),
  executionSegmentSequence: z.string().or(z.null()).optional(),
  ext: z.record(collectorOptionsSchema).or(z.null()).optional(),
  hosts: z.record(z.string()).or(z.null()).optional(),
  httpDebug: z.string().or(z.null()).optional(),
  insecureSkipTLSVerify: z.boolean().or(z.null()).optional(),
  iterations: z.number().or(z.null()).optional(),
  linger: z.boolean().or(z.null()).optional(),
  maxRedirects: z.number().or(z.null()).optional(),
  minIterationDuration: z.string().or(z.null()).optional(),
  noConnectionReuse: z.boolean().or(z.null()).optional(),
  noCookiesReset: z.boolean().or(z.null()).optional(),
  noUsageReport: z.boolean().or(z.null()).optional(),
  noVUConnectionReuse: z.boolean().or(z.null()).optional(),
  paused: z.boolean().or(z.null()).optional(),
  rps: z.number().or(z.null()).optional(),
  scenarios: z.record(scenarioSchema).or(z.null()).optional(),
  setupTimeout: z.string().or(z.null()).optional(),
  stages: z.array(stagesSchema).or(z.null()).optional(),
  summaryTrendStats: z.array(z.string()).or(z.null()).optional(),
  systemTags: z.array(z.string()).or(z.null()).optional(),
  tags: z.record(z.string()).or(z.null()).optional(),
  teardownTimeout: z.string().or(z.null()).optional(),
  thresholds: z.record(z.array(thresholdsSchema)).or(z.null()).optional(),
  throw: z.boolean().or(z.null()).optional(),
  tlsAuth: z.array(certificateSchema).or(z.null()).optional(),
  tlsCipherSuites: z.array(cipherSuiteSchema).or(z.null()).optional(),
  tlsVersion: z
    .union([
      z.string(),
      z.object({
        min: z.string(),
        max: z.string(),
      }),
    ])
    .or(z.null())
    .optional(),
  userAgent: z.string().or(z.null()).optional(),
  vus: z.number().or(z.null()).optional(),
  vusMax: z.number().or(z.null()).optional(),
})

// Custom additons in GlobeTest to the original K6 schema
const additionalOptionsSchema = z.object({
  executionMode: z.enum(['httpSingle', 'httpMultiple']),
  loadDistribution: z.array(
    z.object({
      location: z.string(),
      fraction: z.number(),
    })
  ),
  outputConfig: z.union([
    z.object({
      graphs: z.array(graphConfigSchema),
    }),
    z.null(),
  ]),
})

export const globeTestOptionsSchema = z.intersection(
  originalGlobeTestOptionsSchema,
  additionalOptionsSchema
)

export type GlobeTestOptions = z.infer<typeof globeTestOptionsSchema>
