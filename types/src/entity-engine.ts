import { Team } from '@prisma/client'
import { Jwt, JwtPayload } from 'jsonwebtoken'

import type { UnderlyingRequest } from './entities'
import { TeamRole } from './team'
import { GlobeTestOptions } from './test-manager/globe-test'

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

type RestCreateResponse = {
  branchId: string
  collectionId: string
  underlyingRequest: UnderlyingRequest
  finalRequestEndpoint: string
  source: string
  sourceName: string
  jobId: string
  createdByUserId: string
  finalRequestHeaders: Record<string, string>
} & (
  | {
      executionAgent: 'Cloud'
    }
  | {
      executionAgent: 'Local'
      localJobId?: string
    }
)

export type EntityEngineServersideMessages = {
  'connection-params': {
    scopeId: string
    bearer: string
    projectId: string
    testType: 'rest'
  }
  'rest-create-response': RestCreateResponse
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
  'rest-delete-response': {
    branchId: string
    collectionId: string
    responseId: string
  }
}
