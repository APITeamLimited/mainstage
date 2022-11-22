import { Team } from '@prisma/client'
import { Jwt, JwtPayload } from 'jsonwebtoken'

import { TeamRole } from './team'

import { ExecutionParams, GlobeTestOptions, RESTRequest, RESTResponse } from '.'

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

export type EntityEngineServersideMessages = {
  'connection-params': {
    scopeId: string
    bearer: string
    projectId: string
    testType: 'rest'
  }
  'rest-create-response': {
    branchId: string
    collectionId: string
    underlyingRequest: RESTResponse['underlyingRequest']
    finalRequestEndpoint: string
    source: string
    sourceName: string
    jobId: string
    createdByUserId: string
    finalRequestHeaders: Record<string, string>
  }
  'rest-add-options': {
    branchId: string
    collectionId: string
    options: GlobeTestOptions
  }
  'rest-handle-success-single': {
    branchId: string
    collectionId: string
    responseStatus: number
    responseSize: number
    responseDuration: number
    responseStoreReceipt: string
    metricsStoreReceipt: string
    globeTestLogsStoreReceipt: string
  }
  'rest-handle-success-multiple': {
    branchId: string
    collectionId: string
    metricsStoreReceipt: string
    globeTestLogsStoreReceipt: string
  }
  'rest-handle-failure': {
    branchId: string
    collectionId: string
    globeTestLogsStoreReceipt: string | null
    metricsStoreReceipt: string | null
  }
}
