import { Jwt } from 'jsonwebtoken'
import queryString from 'query-string'
import { Socket } from 'socket.io'

import { Scope } from '../../../api/types/graphql'
import { findScope, verifyJWT } from '../services'

export const handlePostAuth = async (
  socket: Socket
): Promise<null | {
  scope: Scope
  jwt: Jwt
}> => {
  const jwt = await verifyJWT(socket.request)

  if (jwt === false) {
    return null
  }

  const scopeId =
    queryString
      .parse(socket.request.url?.split('?')[1] || '')
      .scopeId?.toString() || undefined

  if (!scopeId) {
    return null
  }

  const scope = await findScope(scopeId)

  if (scope === null) {
    return null
  }

  return {
    scope,
    jwt,
  }
}
