import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'
import * as Y from 'yjs'

import { CurrentUser } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import {
  activeWorkspaceIdVar,
  Workspace,
  workspacesVar,
} from 'src/contexts/reactives'

import { WebsocketProvider } from '../websocket-provider'

const entityEngineUrl = 'ws://0.0.0.0:8912'

const GET_BEARER_PUBKEY__SCOPES_QUERY = gql`
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

type Bearer = JwtPayload & { userId: string }

type AuthenticatedEntityEngineProps = {
  currentUser: CurrentUser
  children?: React.ReactNode
}

export const AuthenticatedEntityEngine = ({
  currentUser,
  children,
}: AuthenticatedEntityEngineProps) => {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [bearer, setBearer] = useState<Bearer | null>(null)
  const [rawBearer, setRawBearer] = useState<string | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [websocketProvider, setWebsocketProvider] =
    useState<WebsocketProvider | null>(null)
  const [ready, setReady] = useState<boolean>(false)
  const [scopes, setScopes] = useState<GetBearerPubkeyScopes['scopes']>([])

  // Get bearer token from gql query
  const { data, error } = useQuery<GetBearerPubkeyScopes>(
    GET_BEARER_PUBKEY__SCOPES_QUERY,
    {
      skip: bearerExpiry > Date.now(),
    }
  )

  useEffect(() => {
    setReady(
      activeWorkspace !== null &&
        activeWorkspace?.__typename !== 'Local' &&
        publicKey !== null &&
        bearer !== null &&
        rawBearer !== null &&
        bearerExpiry > Date.now()
    )
  }, [activeWorkspace, bearer, bearerExpiry, publicKey, rawBearer])

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [workspaces, activeWorkspaceId])

  // Handle jwt_decode updates
  useEffect(() => {
    if (!data) return

    setPublicKey(data.publicKey)

    const decodedToken: Bearer = jwt_decode(data.bearer) as unknown as Bearer

    if (!decodedToken.exp) throw 'No expiry in bearer token'
    if (!decodedToken.userId) throw 'No userId in bearer token'

    setBearer(decodedToken)
    setBearerExpiry(decodedToken.exp * 1000)
    setRawBearer(data.bearer)
    setScopes(data.scopes)

    const newWorkspaces: Workspace[] = workspaces.filter(
      (workspace) => workspace.__typename === 'Local'
    )

    data.scopes.forEach((scope) => {
      if (scope.variant === 'USER') {
        newWorkspaces.push({
          __typename: scope.variant === 'USER' ? 'User' : 'Team',
          id: scope.variantTargetId,
          name: 'Personal Cloud',
        })
      }
    })

    workspacesVar(newWorkspaces)
  }, [currentUser, data, publicKey, workspaces])

  // Create and destroy the websocket provider based on readiness
  useEffect(() => {
    if (!ready && websocketProvider) {
      websocketProvider.disconnect()
      setWebsocketProvider(null)
    }
    if (ready && !websocketProvider) {
      const activeScope = scopes.find(
        (scope) => scope.variantTargetId === activeWorkspaceId
      )

      if (!activeScope) {
        console.log(scopes, activeWorkspace)
        throw `No active scope for workspace ${activeWorkspaceId}`
      }

      const doc = new Y.Doc()

      const websocketProvider = new WebsocketProvider({
        serverUrl: entityEngineUrl,
        scopeId: activeScope.id,
        doc,
        options: {
          params: {
            bearer: rawBearer || '',
          },
        },
      })

      setWebsocketProvider(websocketProvider)

      return function cleanup() {
        websocketProvider.disconnect()
      }
    }
  }, [
    activeWorkspace,
    activeWorkspaceId,
    rawBearer,
    ready,
    scopes,
    websocketProvider,
  ])

  if (error) {
    throw error
  }

  return <>{children}</>
}
