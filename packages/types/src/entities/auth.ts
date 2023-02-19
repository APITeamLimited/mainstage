import { z } from 'zod'

import { isoStringRegex } from '../type-utils'

const authInheritSchema = z.object({
  authType: z.literal('inherit'),
})

export type AuthInherit = z.infer<typeof authInheritSchema>

const authNoneSchema = z.object({
  authType: z.literal('none'),
})

export type AuthNone = z.infer<typeof authNoneSchema>

const authBasicSchema = z.object({
  authType: z.literal('basic'),
  username: z.string(),
  password: z.string(),
})

export type AuthBasic = z.infer<typeof authBasicSchema>

const authBearerSchema = z.object({
  authType: z.literal('bearer'),
  token: z.string(),
})

export type AuthBearer = z.infer<typeof authBearerSchema>

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

export const authOAuth2Schema = z.intersection(
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

export type AuthOAuth2GrantType = z.infer<typeof grantTypeSchema>['grantType']

export type AuthOAuth2 = z.infer<typeof authOAuth2Schema>

export type WrappedOAuth2Token = AuthOAuth2['existingAccessTokens'][number]

export const defaultOAuth2Config = (
  grantType: AuthOAuth2['grantType']
): AuthOAuth2 => {
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

export const oauth2LoadLocal = (
  auth: Auth,
  oauthLocalSaveKey?: string
): Auth => {
  if (
    auth.authType !== 'oauth2' ||
    typeof localStorage === 'undefined' ||
    !oauthLocalSaveKey
  ) {
    return auth
  }

  const localAuthsRaw = localStorage.getItem(
    `apiteam:oauth2:${oauthLocalSaveKey}:auths`
  )

  const localAuths = localAuthsRaw
    ? (JSON.parse(localAuthsRaw) as WrappedOAuth2Token[])
    : []

  // Prevent feedback loop by mutating the original object, else unwanted re-renders as this is just the initial load
  // Ensure no duplicates
  auth.existingAccessTokens = auth.existingAccessTokens.concat(
    localAuths.filter(
      (localAuth) =>
        !auth.existingAccessTokens.find(
          (token) => token.token.access_token === localAuth.token.access_token
        )
    )
  )

  return auth
}

const authAPIKeySchema = z.object({
  authType: z.literal('api-key'),
  key: z.string(),
  value: z.string(),
  addTo: z.enum(['header', 'query']),
})

export type AuthAPIKey = z.infer<typeof authAPIKeySchema>

export const authSchema = z.union([
  authInheritSchema,
  authNoneSchema,
  authBasicSchema,
  authBearerSchema,
  authOAuth2Schema,
  authAPIKeySchema,
])

export type Auth = z.infer<typeof authSchema>
