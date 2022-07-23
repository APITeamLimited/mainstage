import { IncomingMessage } from 'http'

import JWT from 'jsonwebtoken'
import queryString from 'query-string'
import WebSocket from 'ws'

import { Scope } from '../../../api/types/graphql'
import { checkValue } from '../config'

import { findScope } from './scope'

const audience = checkValue<string>('entityAuth.jwt.audience')
const issuer = checkValue<string>('entityAuth.jwt.issuer')

let lastCheckedPublicKey = 0
let publicKey = ''

export const getAndSetAPIPublicKey = async (): Promise<string> => {
  publicKey = ''
  throw 'Not implemented'
}

export const verifyJWT = async (
  request: IncomingMessage
): Promise<JWT.Jwt | false> => {
  const authHeader = request.headers.authorization
  if (!authHeader) {
    return false
  }

  const [, token] = authHeader.split(' ')

  if (!token) {
    return false
  }

  try {
    return JWT.verify(token, publicKey, {
      audience,
      issuer,
      complete: true,
    })
  } catch (error) {
    // If invalid check if the public key has changed if been more than a minute
    // since the last check
    if (
      lastCheckedPublicKey &&
      new Date().getTime() - lastCheckedPublicKey > 60000
    ) {
      await getAndSetAPIPublicKey()
      lastCheckedPublicKey = new Date().getTime()

      return JWT.verify(token, publicKey, {
        audience,
        issuer,
        complete: true,
      })
    }

    return false
  }
}

const verifyScope = async (
  request: IncomingMessage,
  jwt: JWT.Jwt
): Promise<boolean> => {
  const params = queryString.parse(request.url || '')

  const scopeId = params.scopeId?.toString() || undefined

  if (!scopeId) {
    return false
  }

  const scope = await findScope(scopeId)

  if (!scope) {
    return false
  }

  if (typeof jwt.payload === 'string') {
    throw 'Type of jwt cannot be string'
  }

  // Ensure the user is the target of the scope
  // Just in case 2 undefined values are passed in pass 'No id'
  return scope.userId === (jwt.payload.userId?.toString() || 'No Id')
}

export const handleAuth = async (
  client: WebSocket.WebSocket,
  request: IncomingMessage
) => {
  const jwt = await verifyJWT(request)

  if (!jwt) {
    client.close()
    return false
  }

  if (!(await verifyScope(request, jwt))) {
    client.close()
    return false
  }

  return true
}
