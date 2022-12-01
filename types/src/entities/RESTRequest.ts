import { z } from 'zod'

import { keyValueItemSchema, defaultKVSchema } from '../key-value-item'

import { baseEntitySchema } from './base'

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

const restAuthInheritSchema = z.object({
  authType: z.literal('inherit'),
})

export type RESTAuthInherit = z.infer<typeof restAuthInheritSchema>

const restAuthNoneSchema = z.object({
  authType: z.literal('none'),
})

export type RESTAuthNone = z.infer<typeof restAuthNoneSchema>

const restAuthBasicSchema = z.object({
  authType: z.literal('basic'),
  username: z.string(),
  password: z.string(),
})

export type RESTAuthBasic = z.infer<typeof restAuthBasicSchema>

const restAuthBearerSchema = z.object({
  authType: z.literal('bearer'),
  token: z.string(),
})

export type RESTAuthBearer = z.infer<typeof restAuthBearerSchema>

const restAuthOAuth2Schema = z.object({
  authType: z.literal('oauth-2'),
  token: z.string(),
  oidcDiscoveryURL: z.string(),
  authURL: z.string(),
  accessTokenURL: z.string(),
  clientID: z.string(),
  scope: z.string(),
})

export type RESTAuthOAuth2 = z.infer<typeof restAuthOAuth2Schema>

const restAuthAPIKeySchema = z.object({
  authType: z.literal('api-key'),
  key: z.string(),
  value: z.string(),
  addTo: z.enum(['header', 'query']),
})

export type RESTAuthAPIKey = z.infer<typeof restAuthAPIKeySchema>

const restAuthSchema = z.union([
  restAuthInheritSchema,
  restAuthNoneSchema,
  restAuthBasicSchema,
  restAuthBearerSchema,
  restAuthOAuth2Schema,
  restAuthAPIKeySchema,
])

export type RESTAuth = z.infer<typeof restAuthSchema>

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
    body: keyValueItemSchema(defaultKVSchema),
  }),
  z.object({
    contentType: z.literal('multipart/form-data'),
    body: keyValueItemSchema(defaultKVSchema),
  }),
])

export type RESTRequestBody = z.infer<typeof restRequestBodySchema>

// export type RESTReqBody =
//   | {
//       contentType: Exclude<
//         ValidContentTypes,
//         | 'multipart/form-data'
//         | 'application/x-www-form-urlencoded'
//         | 'application/octet-stream'
//       >
//       body: string
//     }
//   | {
//       contentType: 'none'
//       body: null
//     }
//   | {
//       contentType: 'application/x-www-form-urlencoded'
//       body: KeyValueItem<DefaultKV>[]
//     }
//   | {
//       contentType: 'multipart/form-data'
//       // TODO: may add support for files in the future
//       body: KeyValueItem<DefaultKV>[]
//     }
// // | {
// //     contentType: 'application/octet-stream'
// //     body: {
// //       data: StoredObject<string | ArrayBuffer>
// //       filename: string
// //     } | null
// //   }

const executionScriptSchema = z.object({
  script: z.string(),
  language: z.literal('javascript'),
  name: z.string(),
  builtIn: z.boolean().optional(),
  description: z.string().optional(),
})

export type ExecutionScript = z.infer<typeof executionScriptSchema>

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
    auth: restAuthSchema,
    body: restRequestBodySchema,
    description: z.string().optional(),
    pathVariables: z.array(keyValueItemSchema(defaultKVSchema)),
    executionScripts: z.array(executionScriptSchema),
  })
)

export type RESTRequest = z.infer<typeof restRequestSchema>

// export interface RESTRequest extends BaseEntity {
//   __typename: 'RESTRequest'
//   parentId: string
//   __parentTypename: 'Collection' | 'Folder'
//   name: string
//   orderingIndex: number
//   method: string
//   endpoint: string
//   params: KeyValueItem<DefaultKV>[]
//   headers: KeyValueItem<DefaultKV>[]
//   auth: RESTAuth
//   body: RESTReqBody
//   description: string
//   pathVariables: KeyValueItem<DefaultKV>[]
//   executionScripts: ExecutionScript[]
// }
