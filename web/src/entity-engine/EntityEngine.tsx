import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import { IndexeddbPersistence } from 'y-indexeddb'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { CurrentUser, useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import {
  activeWorkspaceIdVar,
  Workspace,
  workspacesVar,
} from 'src/contexts/reactives'

import { handleProviders } from './handle-providers'
import { SocketIOProvider } from './socket-io-provider'
import {
  Bearer,
  determineIfReady,
  GET_BEARER_PUBKEY__SCOPES_QUERY,
  intialReadyStatus,
  processAuthData,
  ReadyStatus,
} from './utils'

type EntityEngineProps = {
  currentUser: CurrentUser
  children?: React.ReactNode
}

export const EntityEngine = ({ children }: EntityEngineProps) => {
  const { currentUser, isAuthenticated } = useAuth()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [bearer, setBearer] = useState<Bearer | null>(null)
  const [rawBearer, setRawBearer] = useState<string | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [doc, setDoc] = useState<Y.Doc | null>(null)
  const [socketioProvider, setSocketioProvider] =
    useState<SocketIOProvider | null>(null)
  const [indexeddbProvider, setIndexeddbProvider] =
    useState<IndexeddbPersistence | null>(null)
  const [ready, setReady] = useState<ReadyStatus>(intialReadyStatus)
  const [scopes, setScopes] = useState<GetBearerPubkeyScopes['scopes']>([])

  // Get bearer token from gql query
  const { data, error } = useQuery<GetBearerPubkeyScopes>(
    GET_BEARER_PUBKEY__SCOPES_QUERY,
    {
      skip: bearerExpiry > Date.now(),
    }
  )

  useEffect(() => {
    determineIfReady({
      activeWorkspace,
      publicKey,
      bearer,
      rawBearer,
      bearerExpiry,
      scopes,
      setReady,
    })
  }, [activeWorkspace, bearer, bearerExpiry, publicKey, rawBearer, scopes])

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [workspaces, activeWorkspaceId])

  // Handle GetBearerPubkeyScopes updates
  useEffect(() => {
    processAuthData({
      data,
      workspaces,
      setPublicKey,
      setBearer,
      setBearerExpiry,
      setRawBearer,
      setScopes,
    })
  }, [data, workspaces])

  // Create and destroy the providers based on readiness
  useEffect(() => {
    handleProviders({
      ready,
      activeWorkspace,
      rawBearer,
      scopes,
      doc,
      setDoc,
      socketioProvider,
      setSocketioProvider,
      indexeddbProvider,
      setIndexeddbProvider,
    })
  }, [
    activeWorkspace,
    doc,
    indexeddbProvider,
    rawBearer,
    ready,
    scopes,
    socketioProvider,
  ])

  if (error) {
    throw error
  }

  return <>{children}</>
}
