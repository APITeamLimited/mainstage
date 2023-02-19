import { Workspace } from '@apiteam/types'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

export type Bearer = JwtPayload & { userId: string }

type ProcessAuthDataArgs = {
  data: GetBearerPubkeyScopes | undefined
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  setPublicKey: (key: string | null) => void
  setBearer: (bearer: Bearer | null) => void
  setBearerExpiry: (expiry: number) => void
  setRawBearer: (bearer: string | null) => void
  setScopes: (scopes: GetBearerPubkeyScopes['scopes']) => void
  switchToTeam?: string
  setActiveWorkspace: (workspace: Workspace | null) => void
}

export const processAuthData = ({
  data,
  activeWorkspaceId,
  workspaces,
  setPublicKey,
  setBearer,
  setBearerExpiry,
  setRawBearer,
  setScopes,
  switchToTeam,
  setActiveWorkspace,
}: ProcessAuthDataArgs) => {
  if (!data) {
    // No data yet, just return
    return
  }

  setPublicKey(data.publicKey)

  const decodedToken: Bearer = jwt_decode(data.bearer) as unknown as Bearer

  if (!decodedToken.exp) throw 'No expiry in bearer token'
  if (!decodedToken.userId) throw 'No userId in bearer token'

  // TODO: Ensure valid aud and iss

  setBearer(decodedToken)
  setBearerExpiry(decodedToken.exp * 1000)
  setRawBearer(data.bearer)
  setScopes(data.scopes)

  const newWorkspaces: Workspace[] = workspaces.filter(
    (workspace) => !workspace.remote
  )

  data.scopes.forEach((scope) => {
    if (scope.variant === 'USER' && scope.__typename === 'Scope') {
      newWorkspaces.push({
        __typename: 'Workspace',
        id: scope.variantTargetId,
        scope: {
          id: scope.id,
          variant: scope.variant,
          variantTargetId: scope.variantTargetId,
          role: scope.role ?? null,
          createdAt: new Date(scope.createdAt as string),
          updatedAt: scope.updatedAt
            ? new Date(scope.updatedAt as string)
            : null,
          userId: scope.userId,
          displayName: scope.displayName,
          profilePicture: scope.profilePicture ?? null,
          slug: scope.slug,
          planName: scope.planName,
        },
        remote: true,
        isTeam: false,
        createdAt: new Date(scope.createdAt),
        updatedAt: scope.updatedAt ? new Date(scope.updatedAt) : null,
      })
    } else if (scope.variant === 'TEAM' && scope.__typename === 'Scope') {
      newWorkspaces.push({
        __typename: 'Workspace',
        id: scope.variantTargetId,
        scope: {
          id: scope.id,
          variant: scope.variant,
          variantTargetId: scope.variantTargetId,
          role: scope.role ?? null,
          createdAt: new Date(scope.createdAt as string),
          updatedAt: scope.updatedAt
            ? new Date(scope.updatedAt as string)
            : null,
          userId: scope.userId,
          displayName: scope.displayName,
          profilePicture: scope.profilePicture ?? null,
          slug: scope.slug,
          planName: scope.planName,
        },
        remote: true,
        isTeam: true,
        createdAt: new Date(scope.createdAt),
        updatedAt: scope.updatedAt ? new Date(scope.updatedAt) : null,
      })
    }
  })

  let newWorkspaceId = activeWorkspaceId

  if (!newWorkspaceId) {
    const localStorageId = localStorage.getItem('activeWorkspaceId')
    if (localStorageId) {
      newWorkspaceId = localStorageId
    } else {
      const personalWorkspace = newWorkspaces.find(
        (workspace) => workspace.scope.variant === 'USER'
      )

      if (!personalWorkspace) {
        throw new Error('No personal workspace found')
      }

      newWorkspaceId = personalWorkspace.id
    }
  }

  workspacesVar(newWorkspaces)

  if (switchToTeam) {
    const workspace = newWorkspaces.find(
      (workspace) => workspace.id === switchToTeam
    )
    if (workspace && workspace.id !== activeWorkspaceId) {
      if (
        newWorkspaces.find((workspace) => workspace.id === newWorkspaceId) !==
        undefined
      ) {
        newWorkspaceId = workspace.id
      }
    }
  }

  let activeWorkspace = newWorkspaces.find(
    (workspace) => workspace.id === newWorkspaceId
  )

  if (!activeWorkspace) {
    // Try and set to personal workspace as a fallback
    activeWorkspace = newWorkspaces.find(
      (workspace) => workspace.scope.variant === 'USER'
    )

    if (activeWorkspace) {
      newWorkspaceId = activeWorkspace.id
    }
  }

  if (!activeWorkspace) {
    throw new Error('No active workspace found')
  }

  activeWorkspaceIdVar(newWorkspaceId)
  setActiveWorkspace(activeWorkspace)
}

export const GET_BEARER_PUBKEY_SCOPES_QUERY = gql`
  query GetBearerPubkeyScopes {
    bearer
    publicKey
    scopes {
      id
      variant
      variantTargetId
      role
      createdAt
      updatedAt
      userId
      displayName
      profilePicture
      slug
      planName
    }
  }
`

export const GET_SCOPES_QUERY = gql`
  query GetScopes {
    bearer
    publicKey
    scopes {
      id
      variant
      variantTargetId
      role
      createdAt
      updatedAt
      userId
      displayName
      profilePicture
      slug
      planName
    }
  }
`

export const GET_PUBLIC_BEARER = gql`
  query GetPublicBearer($clientID: ID!, $scopeId: String!) {
    publicBearer(clientID: $clientID, scopeId: $scopeId)
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

  if (!activeWorkspace.remote) {
    setReady({
      socketioProviderReady: false,
      indexeddbProviderReady: true,
    })
    return
  }

  if (!scopes.find((scope) => scope.variantTargetId === activeWorkspace.id)) {
    setReady({
      socketioProviderReady: false,
      indexeddbProviderReady: false,
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
      //indexeddbProviderReady: true,
      indexeddbProviderReady: false,
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
