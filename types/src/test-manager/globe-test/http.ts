import { z } from 'zod'

// The old type
// export interface GlobeTestRequest<RT extends ResponseType | undefined> {
//   method: string
//   url: string
//   body?: RequestBody | null
//   params?: RefinedParams<RT> | null
// }

export const globeTestRequestSchema = z.object({
  method: z.string(),
  url: z.string(),
  body: z.union([z.string(), z.null()]),
  params: z.object({
    headers: z.record(z.string()),
  }),
})

export type GlobeTestRequest = z.infer<typeof globeTestRequestSchema>

export const cipherSuiteSchema = z.enum([
  'TLS_RSA_WITH_RC4_128_SHA',
  'TLS_RSA_WITH_3DES_EDE_CBC_SHA',
  'TLS_RSA_WITH_AES_128_CBC_SHA',
  'TLS_RSA_WITH_AES_128_CBC_SHA256',
  'TLS_RSA_WITH_AES_256_CBC_SHA',
  'TLS_RSA_WITH_AES_128_GCM_SHA256',
  'TLS_RSA_WITH_AES_256_GCM_SHA384',
  'TLS_ECDHE_RSA_WITH_RC4_128_SHA',
  'TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA',
  'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
  'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256',
  'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
  'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
  'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
  'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305',
  'TLS_ECDHE_ECDSA_WITH_RC4_128_SHA',
  'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
  'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256',
  'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
  'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
  'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
  'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305',
  'TLS_AES_128_GCM_SHA256',
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
])

const responseBodySchema = z.unknown()

const responseCookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  domain: z.string(),
  path: z.string(),
  httpOnly: z.boolean(),
  secure: z.boolean(),
  maxAge: z.number(),
  expires: z.number(),
})

export type ResponseCookie = z.infer<typeof responseCookieSchema>

const protocolSchema = z.unknown()

const requestCookieSchema = z.unknown()

// TODO: maybe provide more info for case of monitoring response bodies?
export const globeTestResponseSchema = z.object({
  body: responseBodySchema,
  cookies: z.record(responseCookieSchema),
  error: z.string(),
  error_code: z.number(),
  headers: z.record(z.string()),
  ocsp: z.object({
    produced_at: z.number(),
    this_update: z.number(),
    next_update: z.number(),
    revocation_reason: z.string(),
    revocated_at: z.number(),
    status: z.string(),
  }),
  proto: protocolSchema,
  remote_ip: z.string(),
  remote_port: z.number(),
  request: z.object({
    body: z.string(),
    cookies: z.record(requestCookieSchema),
    headers: z.record(z.string()),
    method: z.string(),
    url: z.string(),
  }),
  status: z.number(),
  status_text: z.string(),
  timings: z.object({
    blocked: z.number(),
    connecting: z.number(),
    tls_handshaking: z.number(),
    sending: z.number(),
    waiting: z.number(),
    receiving: z.number(),
    duration: z.number(),
  }),
  tls_cipher_suite: cipherSuiteSchema,
  tls_version: z.string(),
  url: z.string(),
})

export type GlobeTestResponse = z.infer<typeof globeTestResponseSchema>
