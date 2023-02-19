import { z } from 'zod'

import { keyValueItemSchema, defaultKVSchema } from '../key-value-item'

import { authSchema } from './auth'
import { baseEntitySchema } from './base'
import { executionOptionsSchema } from './execution-options'
import { executionScriptSchema } from './shared'

export const knownContentTypes = {
  'application/json': 'JSON',
  //'application/ld+json': 'json',
  //'application/hal+json': 'json',
  //'application/vnd.api+json': 'json',
  'application/xml': 'XML',
  'application/x-www-form-urlencoded': 'Form URL Encoded',
  'multipart/form-data': 'Form Data',
  'text/html': 'HTML',
  'text/plain': 'Plain',
  // 'application/octet-stream': 'File',
  none: 'None',
} as const

export const getKnownContentTypes = () => Object.keys(knownContentTypes)
export const getPrettyContentTypes = () => Object.values(knownContentTypes)

const knownContentTypeSchema = z.enum([
  'application/json',
  'application/xml',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/html',
  'text/plain',
  'none',
])

export type ValidContentTypes = z.infer<typeof knownContentTypeSchema>

const restRequestBodySchema = z.union([
  z.object({
    contentType: z.literal('application/json'),
    body: z.string(),
  }),
  z.object({
    contentType: z.literal('application/xml'),
    body: z.string(),
  }),
  z.object({
    contentType: z.literal('text/html'),
    body: z.string(),
  }),
  z.object({
    contentType: z.literal('text/plain'),
    body: z.string(),
  }),
  z.object({
    contentType: z.literal('none'),
    body: z.null(),
  }),
  z.object({
    contentType: z.literal('application/x-www-form-urlencoded'),
    body: keyValueItemSchema(defaultKVSchema).array(),
  }),
  z.object({
    contentType: z.literal('multipart/form-data'),
    body: keyValueItemSchema(defaultKVSchema).array(),
  }),
])

export type RESTRequestBody = z.infer<typeof restRequestBodySchema>

export const pathVariablesSchema = z.array(keyValueItemSchema(defaultKVSchema))
export type PathVariables = z.infer<typeof pathVariablesSchema>

export const restRequestSchema = baseEntitySchema.merge(
  z.object({
    __typename: z.literal('RESTRequest'),
    parentId: z.string().uuid(),
    __parentTypename: z.enum(['Collection', 'Folder']),
    name: z.string(),
    orderingIndex: z.number(),
    method: z.string(),
    endpoint: z.string(),
    params: z.array(keyValueItemSchema(defaultKVSchema)),
    headers: z.array(keyValueItemSchema(defaultKVSchema)),
    auth: authSchema,
    body: restRequestBodySchema,
    description: z.string().optional(),
    pathVariables: pathVariablesSchema,
    executionScripts: z.array(executionScriptSchema),
    executionOptions: executionOptionsSchema.optional(),
  })
)

export type RESTRequest = z.infer<typeof restRequestSchema>
