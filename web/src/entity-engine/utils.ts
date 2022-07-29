import jwt_decode, { JwtPayload } from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'

import {
  activeWorkspaceIdVar,
  Workspace,
  workspacesVar,
} from 'src/contexts/reactives'

export type Bearer = JwtPayload & { userId: string }

type ProcessAuthDataArgs = {
  data: GetBearerPubkeyScopes | undefined
  workspaces: Workspace[]
  setPublicKey: (key: string | null) => void
  setBearer: (bearer: Bearer | null) => void
  setBearerExpiry: (expiry: number) => void
  setRawBearer: (bearer: string | null) => void
  setScopes: (scopes: GetBearerPubkeyScopes['scopes']) => void
}

export const processAuthData = ({
  data,
  workspaces,
  setPublicKey,
  setBearer,
  setBearerExpiry,
  setRawBearer,
  setScopes,
}: ProcessAuthDataArgs) => {
  if (!data) {
    // No data yet, just return
    return
  }

  setPublicKey(data.publicKey)

  const decodedToken: Bearer = jwt_decode(data.bearer) as unknown as Bearer

  if (!decodedToken.exp) throw 'No expiry in bearer token'
  if (!decodedToken.userId) throw 'No userId in bearer token'

  setBearer(decodedToken)
  setBearerExpiry(decodedToken.exp * 1000)
  setRawBearer(data.bearer)
  setScopes(data.scopes)

  const newWorkspaces: Workspace[] = workspaces.filter(
    (workspace) => workspace.planInfo.type === 'LOCAL'
  )

  data.scopes.forEach((scope) => {
    if (scope.variant === 'USER') {
      newWorkspaces.push({
        __typename: 'Workspace',
        id: scope.variantTargetId,
        name: 'Personal Cloud',

        // TODO: actually imlement this
        planInfo: {
          type: 'FREE',
          remote: true,
          isTeam: false,
        },
      })
    }
  })

  activeWorkspaceIdVar(newWorkspaces[0].id)

  workspacesVar(newWorkspaces)
}

export const GET_BEARER_PUBKEY__SCOPES_QUERY = gql`
  query GetBearerPubkeyScopes {
    bearer
    publicKey
    scopes {
      id
      variant
      variantTargetId
      userId
    }
  }
`

type DetermineIfReadyArgs = {
  activeWorkspace: Workspace | null
  publicKey: string | null
  bearer: Bearer | null
  rawBearer: string | null
  bearerExpiry: number
  scopes: GetBearerPubkeyScopes['scopes']
  setReady: (readyStatus: ReadyStatus) => void
}

export type ReadyStatus = {
  socketioProviderReady: boolean
  indexeddbProviderReady: boolean
}

export const initialReadyStatus: ReadyStatus = {
  socketioProviderReady: false,
  indexeddbProviderReady: false,
}

/**
 * Determines if ready to connect to SocketIOProvider and  IndexeddbPersistence
 */
export const determineIfReady = ({
  activeWorkspace,
  publicKey,
  bearer,
  rawBearer,
  bearerExpiry,
  scopes,
  setReady,
}: DetermineIfReadyArgs) => {
  if (activeWorkspace === null) {
    setReady({
      socketioProviderReady: false,
      indexeddbProviderReady: false,
    })
    return
  }

  const isLocal = activeWorkspace.__typename === 'Local'

  if (isLocal) {
    setReady({
      socketioProviderReady: false,
      indexeddbProviderReady: true,
    })
    return
  }

  if (!scopes.find((scope) => scope.variantTargetId === activeWorkspace.id)) {
    setReady({
      socketioProviderReady: false,
      indexeddbProviderReady: true,
    })
    return
  }

  if (
    publicKey !== null &&
    bearer !== null &&
    rawBearer !== null &&
    bearerExpiry > Date.now()
  ) {
    setReady({
      socketioProviderReady: true,
      indexeddbProviderReady: true,
    })
    return
  }

  setReady({
    socketioProviderReady: false,
    indexeddbProviderReady: true,
  })
  return
}

export type PossibleSyncStatus =
  | 'disabled'
  | 'connecting'
  | 'connected'
  | 'disconnected'
