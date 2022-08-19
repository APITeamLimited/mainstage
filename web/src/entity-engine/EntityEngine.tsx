import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { useReactiveVar } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import { Workspace } from 'types/src'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

import { handleProviders, HandleUpdateDispatchArgs } from './handle-providers'
import { SocketIOProvider } from './socket-io-provider'
import { updateDispatcher } from './update-dispatcher'
import {
  Bearer,
  determineIfReady,
  GET_BEARER_PUBKEY__SCOPES_QUERY,
  initialReadyStatus,
  processAuthData,
  ReadyStatus,
  PossibleSyncStatus,
} from './utils'

type EntityEngineProps = {
  children?: React.ReactNode
}

function useStateCallback<T>(
  initialState: T
): [T, (state: T, cb?: (state: T) => void) => void] {
  const [state, setState] = useState(initialState)
  const cbRef = useRef<((state: T) => void) | undefined>(undefined) // init mutable ref container for callbacks

  const setStateCallback = useCallback((state: T, cb?: (state: T) => void) => {
    cbRef.current = cb // store current, passed callback in ref
    setState(state)
  }, []) // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `undefined` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state)
      cbRef.current = undefined // reset callback after execution
    }
  }, [state])

  return [state, setStateCallback]
}

const DocContext = createContext<Y.Doc | null>(null)
export const useWorkspace = () => useContext(DocContext)

type SyncReadyStatus = {
  socketioProvider: PossibleSyncStatus
  indexeddbProvider: PossibleSyncStatus
}

const initialSyncReadyStatus = {
  socketioProvider: 'disabled',
  indexeddbProvider: 'disabled',
} as SyncReadyStatus

const SyncReadyContext = createContext(initialSyncReadyStatus)
export const useSyncReady = () => useContext(SyncReadyContext)

export const EntityEngine = ({ children }: EntityEngineProps) => {
  const { isAuthenticated } = useAuth()
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
  const [ready, setReady] = useState<ReadyStatus>(initialReadyStatus)
  const [scopes, setScopes] = useState<GetBearerPubkeyScopes['scopes']>([])
  const [socketioSyncStatus, setSocketioSyncStatus] =
    useStateCallback<PossibleSyncStatus>('disabled')
  const [indexeddbSyncStatus, setIndexeddbSyncStatus] =
    useStateCallback<PossibleSyncStatus>('disabled')
  const [doneFirstSync, setDoneFirstSync] = useState(false)

  const socketioSyncStatusRef = useRef<PossibleSyncStatus>(socketioSyncStatus)
  const indexeddbSyncStatusRef = useRef<PossibleSyncStatus>(indexeddbSyncStatus)

  // Get bearer token from gql query
  const { data, error } = useQuery<GetBearerPubkeyScopes>(
    GET_BEARER_PUBKEY__SCOPES_QUERY,
    {
      skip: bearerExpiry > Date.now() || !isAuthenticated,
    }
  )

  // Needed for callbacks to work
  socketioSyncStatusRef.current = socketioSyncStatus
  indexeddbSyncStatusRef.current = indexeddbSyncStatus

  const handleUpdateDispatch = useCallback(
    ({ doc, activeWorkspace, initial }: HandleUpdateDispatchArgs) => {
      updateDispatcher({
        doc,
        activeWorkspace,
        initial,
        socketioSyncStatus: socketioSyncStatusRef.current,
        indexeddbSyncStatus: indexeddbSyncStatusRef.current,
      })
    },
    []
  )

  useEffect(() => {
    if (
      socketioSyncStatus === 'disabled' ||
      socketioSyncStatus === 'disconnected' ||
      socketioSyncStatus === 'connecting'
    ) {
      setDoneFirstSync(false)
    }
    if (socketioSyncStatus === 'connected' && !doneFirstSync) {
      setDoneFirstSync(true)
      syncAgain()
    }

    async function syncAgain() {
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (socketioSyncStatus === 'connected') {
        socketioProvider?.syncAgain()
      }
    }
  }, [doneFirstSync, socketioProvider, socketioSyncStatus])

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
    if (!activeWorkspace) return
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
      setSocketioSyncStatus,
      setIndexeddbSyncStatus,
      handleUpdateDispatch,
    })
  }, [
    activeWorkspace,
    doc,
    handleUpdateDispatch,
    indexeddbProvider,
    indexeddbSyncStatus,
    rawBearer,
    ready,
    scopes,
    setIndexeddbSyncStatus,
    setSocketioSyncStatus,
    socketioProvider,
    socketioSyncStatus,
  ])

  if (error) {
    throw error
  }

  return (
    <div
      key={`${activeWorkspaceId}-${socketioSyncStatus}-${indexeddbSyncStatus}`}
    >
      {/*<span>
        socketioSyncStatus {socketioSyncStatus} indexeddbSyncStatus{' '}
        {indexeddbSyncStatus}
  </span>*/}
      <SyncReadyContext.Provider
        value={{
          socketioProvider: socketioSyncStatus,
          indexeddbProvider: indexeddbSyncStatus,
        }}
      >
        <DocContext.Provider value={doc}>{children}</DocContext.Provider>
      </SyncReadyContext.Provider>
    </div>
  )
}
