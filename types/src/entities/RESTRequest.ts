import { z } from 'zod'

import { keyValueItemSchema, defaultKVSchema } from '../key-value-item'
import { isoStringRegex } from '../type-utils'

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

export const oauth2TokenSchema = z
  .object({
    token_type: z.string(),
    access_token: z.string(),
    refresh_token: z.string().optional(),
    expires_in: z.number(),
    scope: z.string().optional(),
  })
  .catchall(z.unknown())

export type OAuth2Token = z.infer<typeof oauth2TokenSchema>

const grantTypeSchema = z.union([
  z.object({
    grantType: z.literal('authorization-code'),
    redirectURI: z.string().url(),
    authorizationURL: z.string().url(),
    accessTokenURL: z.string().url(),
    clientID: z.string(),
    clientSecret: z.string(),
    scope: z.string().optional(),
    state: z.string(),
    clientAuthentication: z.enum(['header', 'body']),
  }),
  z.object({
    grantType: z.literal('authorization-code-with-pkce'),
    redirectURI: z.string().url(),
    authorizationURL: z.string().url(),
    accessTokenURL: z.string().url(),
    clientID: z.string(),
    clientSecret: z.string(),
    codeChallengeMethod: z.enum(['plain', 'S256']),
    codeVerifier: z.string(),
    scope: z.string().optional(),
    state: z.string(),
    clientAuthentication: z.enum(['header', 'body']),
  }),
  z.object({
    grantType: z.literal('implicit'),
    redirectURI: z.string(),
    authorizationURL: z.string(),
    clientID: z.string(),
    scope: z.string().optional(),
    state: z.string(),
    clientAuthentication: z.enum(['header', 'body']),
  }),
  z.object({
    grantType: z.literal('client-credentials'),
    accessTokenURL: z.string(),
    clientID: z.string(),
    clientSecret: z.string(),
    scope: z.string(),
    clientAuthentication: z.enum(['header', 'body']),
  }),
  z.object({
    grantType: z.literal('resource-owner-password-credentials'),
    accessTokenURL: z.string(),
    clientID: z.string(),
    clientSecret: z.string(),
    username: z.string(),
    password: z.string(),
    scope: z.string().optional(),
    clientAuthentication: z.enum(['header', 'body']),
  }),
])

export const restAuthOAuth2Schema = z.intersection(
  z.object({
    authType: z.literal('oauth2'),
    headerPrefix: z.string(),
    existingAccessTokens: z.array(
      z.union([
        z.object({
          syncType: z.literal('workspace'),
          createdAt: z.string().regex(isoStringRegex),
          token: oauth2TokenSchema,
        }),
        z.object({
          syncType: z.literal('local'),
          createdAt: z.string().regex(isoStringRegex),
          token: oauth2TokenSchema,
        }),
      ])
    ),
  }),
  grantTypeSchema
)

export type RESTAuthOAuth2GrantType = z.infer<
  typeof grantTypeSchema
>['grantType']

export type RESTAuthOAuth2 = z.infer<typeof restAuthOAuth2Schema>

export type WrappedOAuth2Token = RESTAuthOAuth2['existingAccessTokens'][number]

export const defaultOAuth2Config = (
  grantType: RESTAuthOAuth2['grantType']
): RESTAuthOAuth2 => {
  if (grantType === 'authorization-code') {
    return {
      authType: 'oauth2',
      existingAccessTokens: [],
      headerPrefix: 'Bearer',
      grantType: 'authorization-code',
      redirectURI: '',
      accessTokenURL: '',
      authorizationURL: '',
      clientID: '',
      clientSecret: '',
      scope: '',
      state: '',
      clientAuthentication: 'header',
    }
  } else if (grantType === 'authorization-code-with-pkce') {
    return {
      authType: 'oauth2',
      existingAccessTokens: [],
      headerPrefix: 'Bearer',
      grantType: 'authorization-code-with-pkce',
      redirectURI: '',
      accessTokenURL: '',
      authorizationURL: '',
      clientID: '',
      clientSecret: '',
      codeChallengeMethod: 'S256',
      codeVerifier: '',
      scope: '',
      state: '',
      clientAuthentication: 'header',
    }
  } else if (grantType === 'implicit') {
    return {
      authType: 'oauth2',
      existingAccessTokens: [],
      headerPrefix: 'Bearer',
      grantType: 'implicit',
      redirectURI: '',
      authorizationURL: '',
      clientID: '',
      scope: '',
      state: '',
      clientAuthentication: 'header',
    }
  } else if (grantType === 'client-credentials') {
    return {
      authType: 'oauth2',
      existingAccessTokens: [],
      headerPrefix: 'Bearer',
      grantType: 'client-credentials',
      accessTokenURL: '',
      clientID: '',
      clientSecret: '',
      scope: '',
      clientAuthentication: 'header',
    }
  } else if (grantType === 'resource-owner-password-credentials') {
    return {
      authType: 'oauth2',
      existingAccessTokens: [],
      headerPrefix: 'Bearer',
      grantType: 'resource-owner-password-credentials',
      accessTokenURL: '',
      clientID: '',
      clientSecret: '',
      username: '',
      password: '',
      scope: '',
      clientAuthentication: 'header',
    }
  }

  throw new Error('Invalid grant type')
}

const restAuthAPIKeySchema = z.object({
  authType: z.literal('api-key'),
  key: z.string(),
  value: z.string(),
  addTo: z.enum(['header', 'query']),
})

export type RESTAuthAPIKey = z.infer<typeof restAuthAPIKeySchema>

export const restAuthSchema = z.union([
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

// export type RESTRequestBody =
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
//   body: RESTRequestBody
//   description: string
//   pathVariables: KeyValueItem<DefaultKV>[]
//   executionScripts: ExecutionScript[]
// }
