import { Scope } from '@prisma/client'
import * as JWT from 'jsonwebtoken'
import * as queryString from 'query-string'

import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { scopesReadRedis } from 'src/lib/redis'
import { getScope } from 'src/lib/scope'
import { publicKey } from 'src/services/publicKey/publicKey'

import { checkValue } from '../config'

const audience = checkValue<string>('api.bearer.audience')

const issuer = checkValue<string>('api.bearer.issuer')

const verifyJWT = async (token: string): Promise<JWT.Jwt> => {
  let decodedToken: JWT.Jwt | false = false

  const pubKey = await publicKey()

  decodedToken = JWT.verify(token, pubKey, {
    audience,
    issuer,
    complete: true,
  })

  return decodedToken
}

const verifyScope = async (scopeId: string, jwt: JWT.Jwt): Promise<boolean> => {
  const scope = await getScope(scopeId)

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

/*
Checks that a request's bearer token and scopeId are valid.
*/
export const checkBearerScope = async (token: string, scopeId: string) => {
  const jwt = await verifyJWT(token)
  if (!(await verifyScope(scopeId, jwt))) {
    throw new Error('Scope target does not match bearer token')
  }
}
