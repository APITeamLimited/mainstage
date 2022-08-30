import { Jwt, JwtPayload } from 'jsonwebtoken'

export type ClientAwareness = {
  publicBearer?: string
}

export type DecodedPublicBearer = Jwt & {
  payload: JwtPayload & {
    clientID: number
    userID: string
  }
}
