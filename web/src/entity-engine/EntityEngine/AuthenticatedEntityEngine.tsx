import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'
//import { WebsocketProvider } from 'y-websocket'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { CurrentUser } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import {
  activeWorkspaceIdVar,
  Workspace,
  workspacesVar,
} from 'src/contexts/reactives'

import { SocketIOProvider } from '../socketio-provider'

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
  const [scopeProvider, setScopeProvider] = useState<SocketIOProvider | null>(
    null
  )
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
    if (!ready && scopeProvider) {
      scopeProvider.destroy()
      console.log('cleaning up', ready, scopeProvider)
      setScopeProvider(null)
    }
    if (ready && !scopeProvider) {
      const activeScope = scopes.find(
        (scope) => scope.variantTargetId === activeWorkspaceId
      )

      if (!activeScope) {
        console.log(scopes, activeWorkspace)
        throw `No active scope for workspace ${activeWorkspaceId}`
      }

      const doc = new Y.Doc({ guid: activeScope.id })

      const scopeProvider = new SocketIOProvider({
        scopeId: activeScope.id,
        rawBearer: rawBearer || '',
        doc,
        options: {
          onAwarenessUpdate: (awareness) => {
            console.log('awareness bing bing', awareness)
          },
          onStatusChange(status) {
            console.log('status', status)
          },
        },
      })

      //const scopeProvider = new WebsocketProvider(
      //  'ws://localhost:8912',
      //  activeScope.id,
      //  doc
      //)

      scopeProvider.on('status', (message) => {
        console.log('message', message)
        console.log(doc)
      })

      doc.load()

      const rootMap = doc.getMap()
      console.log(rootMap.get('name'))
      console.log(doc.getText('name'))
      console.log(doc.get('projects'))

      setScopeProvider(scopeProvider)
    }
  }, [
    activeWorkspace,
    activeWorkspaceId,
    rawBearer,
    ready,
    scopes,
    scopeProvider,
  ])

  if (error) {
    throw error
  }

  return <>{children}</>
}
