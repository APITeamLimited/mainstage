import { IncomingMessage } from 'http'

import type { Scope } from '@prisma/client'
import type { Jwt } from 'jsonwebtoken'
import { Socket } from 'socket.io'

export type AuthenticatedIncomingMessage = IncomingMessage &
  (
    | {
        jwt: Jwt
        scope: Scope
      }
    | {
        jwt: null
        scope: null
      }
  )

export type AuthenticatedSocket = Socket & {
  scope: Scope
  jwt: Jwt
}
