import { Team } from '@prisma/client'
import { Jwt, JwtPayload } from 'jsonwebtoken'

import { TeamRole } from './team'

export type ClientAwareness = {
  publicBearer?: string
}

export type DecodedPublicBearer = Jwt & {
  payload: JwtPayload & {
    clientID: number
    userId: string
    scopeId: string
  }
}

export type MemberAwareness = {
  userId: string
  displayName: string
  role: TeamRole
  profilePicture: string | null
  joinedTeam: Date
  lastOnline: Date | null
}

export type ServerAwareness = {
  variantTargetId: string
} & (
  | {
      variant: 'TEAM'
      team: Team
      members: MemberAwareness[]
    }
  | {
      variant: 'USER'
    }
)
