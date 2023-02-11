import { IncomingMessage } from 'http'

import { AuthenticatedIncomingMessage } from '@apiteam/types'
import { gql } from '@apollo/client'
import type { Scope } from '@prisma/client'
import type { Jwt } from 'jsonwebtoken'
import JWT from 'jsonwebtoken'
import queryString from 'query-string'
import type { Socket } from 'socket.io'

import { checkValue } from '../config'
import { apolloClient } from '../lib/apollo'
import { getCoreCacheReadRedis } from '../lib/redis'

const audience = checkValue<string>('api.bearer.audience')
const issuer = checkValue<string>('api.bearer.issuer')

let lastCheckedPublicKey = 0
let publicKey: undefined | string = undefined

const findScope = async (id: string): Promise<Scope | null> => {
  const rawScope = await (await getCoreCacheReadRedis()).get(`scope__id:${id}`)
  if (!rawScope) return null
  return JSON.parse(rawScope) as Scope
}

const PublicKeyQuery = gql`
  query PublicKeyQuery {
    publicKey
  }
`

export const getAndSetAPIPublicKey = async (): Promise<string> => {
  const query = await apolloClient.query({
    query: PublicKeyQuery,
  })

  if (query.data?.publicKey) {
    publicKey = query.data.publicKey as string
    return publicKey
  }

  throw 'No public key found'
}

export const verifyJWT = async (
  request: IncomingMessage
): Promise<JWT.Jwt | false> => {
  const token =
    queryString.parse(request.url?.split('?')[1] || '').bearer?.toString() ||
    undefined

  if (!token) {
    return false
  }

  if (publicKey === undefined) {
    await getAndSetAPIPublicKey()
    return await verifyJWT(request)
  }

  let decodedToken: JWT.Jwt | false = false

  try {
    decodedToken = JWT.verify(token, publicKey, {
      audience,
      issuer,
      complete: true,
    })
  } catch (error) {
    // If invalid check if the public key has changed if been more than a minute
    // since the last check, needed to prevent infinite loop
    if (new Date().getTime() - lastCheckedPublicKey > 60000) {
      await getAndSetAPIPublicKey()
      lastCheckedPublicKey = new Date().getTime()
      decodedToken = await verifyJWT(request)
    }
  }

  return decodedToken
}

const verifyScope = async (
  request: IncomingMessage,
  jwt: JWT.Jwt
): Promise<Scope | null> => {
  const scopeId =
    queryString.parse(request.url?.split('?')[1] || '').scopeId?.toString() ||
    undefined

  if (!scopeId) {
    return null
  }

  const scope = await findScope(scopeId)

  if (!scope) {
    return null
  }

  if (typeof jwt.payload === 'string') {
    throw 'Type of jwt cannot be string'
  }

  // Ensure the user is the target of the scope
  // Just in case 2 undefined values are passed in pass 'No id'
  const validScope =
    scope.userId === (jwt.payload.userId?.toString() || 'No Id')

  if (!validScope) {
    return null
  }

  return scope
}

export const handleAuth = async (
  request: IncomingMessage
): Promise<AuthenticatedIncomingMessage> => {
  const jwt = await verifyJWT(request)

  const authenticatedRequest = {
    ...request,
    jwt: null,
    scope: null,
  } as AuthenticatedIncomingMessage

  if (!jwt) {
    return authenticatedRequest
  }

  const scope = await verifyScope(request, jwt)

  if (!scope) {
    return authenticatedRequest
  }

  authenticatedRequest.jwt = jwt
  authenticatedRequest.scope = scope

  return authenticatedRequest
}

export const handlePostAuth = async (
  socket: Socket
): Promise<null | {
  scope: Scope
  jwt: Jwt
}> => {
  const jwt = await verifyJWT(socket.request)
  if (jwt === false) return null

  const scopeId =
    queryString
      .parse(socket.request.url?.split('?')[1] || '')
      .scopeId?.toString() || undefined

  if (!scopeId) return null
  const scope = await findScope(scopeId)
  if (scope === null) return null

  return {
    scope,
    jwt,
  }
}
