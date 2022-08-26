import { IncomingMessage, ServerResponse } from 'http'

import { gql } from '@apollo/client'
import * as JWT from 'jsonwebtoken'
import * as queryString from 'query-string'

import { apolloClient } from '../apollo'
import { checkValue } from '../config'

import { findScope } from './scope'

const audience = checkValue<string>('api.bearer.audience')
const issuer = checkValue<string>('api.bearer.issuer')

let lastCheckedPublicKey = 0
let publicKey: undefined | string = undefined

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

  console.log('No public key found')
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
  }

  let decodedToken: JWT.Jwt | false = false

  try {
    decodedToken = JWT.verify(token, publicKey as string, {
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
): Promise<boolean> => {
  const scopeId =
    queryString.parse(request.url?.split('?')[1] || '').scopeId?.toString() ||
    undefined

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

const handleAuth = async (req: IncomingMessage) => {
  const jwt = await verifyJWT(req)

  if (!jwt) {
    return false
  }

  if (!(await verifyScope(req, jwt))) {
    return false
  }

  return true
}

export const requireScopedAuth = async (
  req: IncomingMessage,
  res: ServerResponse,
  callback: (req: IncomingMessage, res: ServerResponse) => void
) => {
  const isAuthenticated = await handleAuth(req)

  if (!isAuthenticated) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Unauthorized' }))
    return
  }

  callback(req, res)
}
