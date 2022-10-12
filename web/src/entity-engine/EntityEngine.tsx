import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { ServerAwareness, Workspace } from '@apiteam/types/src'
import { useApolloClient } from '@apollo/client'
import { useReactiveVar } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { Doc as YDoc } from 'yjs'

import { useAuth } from '@redwoodjs/auth'
import { useLocation } from '@redwoodjs/router'
import { useQuery } from '@redwoodjs/web'

import { useLib0Module, useYJSModule } from 'src/contexts/imports'
import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

import { handleProviders, HandleUpdateDispatchArgs } from './handle-providers'
import { ScopeUpdater } from './ScopeUpdater'
import { SocketIOManager } from './socket-io-manager'
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

const DocContext = createContext<YDoc | null>(null)
export const useWorkspace = () => useContext(DocContext)

const ScopesContext = createContext<GetBearerPubkeyScopes['scopes'] | null>(
  null
)
export const useScopes = () => useContext(ScopesContext)

const RawBearerContext = createContext<string | null>(null)
export const useRawBearer = () => useContext(RawBearerContext)

const ScopeIdContext = createContext<string | null>(null)
export const useScopeId = () => useContext(ScopeIdContext)

export const RefetchScopesCallbackContext = createContext<
  ((teamId?: string) => Promise<void>) | null
>(null)

export const useRefetchScopesCallback = () =>
  useContext(RefetchScopesCallbackContext)

const AwarenessContext = createContext<ServerAwareness | null>(null)
export const useServerAwareness = () => useContext(AwarenessContext)

const WorkspaceInfoContext = createContext<Workspace | null>(null)
export const useWorkspaceInfo = () => useContext(WorkspaceInfoContext)

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
  const lib0 = useLib0Module()
  const Y = useYJSModule()

  const { isAuthenticated } = useAuth()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [bearer, setBearer] = useState<Bearer | null>(null)
  const [rawBearer, setRawBearer] = useState<string | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)
  const workspaces = useReactiveVar(workspacesVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)

  const scopeId = useMemo(() => {
    if (!activeWorkspace) return null
    return activeWorkspace.scope.id
  }, [activeWorkspace])

  const [doc, setDoc] = useState<YDoc | null>(null)
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
  const [spawnKey] = useState(Math.random().toString(10))

  const socketioSyncStatusRef = useRef<PossibleSyncStatus>(socketioSyncStatus)
  const indexeddbSyncStatusRef = useRef<PossibleSyncStatus>(indexeddbSyncStatus)

  const apolloClient = useApolloClient()

  const [awareness, setAwareness] = useState<ServerAwareness | null>(null)

  // Get bearer token from gql query
  const { data, error } = useQuery<GetBearerPubkeyScopes>(
    GET_BEARER_PUBKEY__SCOPES_QUERY,
    {
      skip: bearerExpiry > Date.now() || !isAuthenticated,
    }
  )

  const { pathname } = useLocation()
  const [inApp, setInApp] = useState(pathname.startsWith('/app/'))

  useEffect(() => {
    // Check if pathname starts with '/app/'
    const newInApp = pathname.startsWith('/app/')
    if (newInApp !== inApp) {
      setInApp(newInApp)
    }
  }, [inApp, pathname])

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

  const refetchScopes = useCallback(
    async (teamId?: string) => {
      const { data } = await apolloClient.query<GetBearerPubkeyScopes>({
        query: GET_BEARER_PUBKEY__SCOPES_QUERY,
        fetchPolicy: 'network-only',
      })

      const filteredSwitchToTeam =
        activeWorkspaceId === teamId ? undefined : teamId

      processAuthData({
        data,
        activeWorkspaceId,
        workspaces,
        setPublicKey,
        setBearer,
        setBearerExpiry,
        setRawBearer,
        setScopes,
        switchToTeam: filteredSwitchToTeam,
      })
    },
    [activeWorkspaceId, apolloClient, workspaces]
  )

  // Handle GetBearerPubkeyScopes updates
  useEffect(() => {
    processAuthData({
      data,
      workspaces,
      activeWorkspaceId,
      setPublicKey,
      setBearer,
      setBearerExpiry,
      setRawBearer,
      setScopes,
    })
  }, [activeWorkspaceId, data, workspaces])

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
      apolloClient,
      setAwareness,
      Y,
      lib0,
    })
  }, [
    activeWorkspace,
    apolloClient,
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
    Y,
    lib0,
  ])

  if (error) {
    throw error
  }

  return (
    <>
      <SocketIOManager
        key={`${activeWorkspaceId}${inApp.toString()}${spawnKey}`}
        // No clue why ts-error here
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        socketioProvider={socketioProvider}
      />
      <div key={socketioSyncStatusRef.current}>
        <SyncReadyContext.Provider
          value={{
            socketioProvider: socketioSyncStatus,
            indexeddbProvider: indexeddbSyncStatus,
          }}
        >
          <DocContext.Provider value={doc}>
            <ScopesContext.Provider value={scopes}>
              <RawBearerContext.Provider value={rawBearer}>
                <RefetchScopesCallbackContext.Provider value={refetchScopes}>
                  <AwarenessContext.Provider value={awareness}>
                    <WorkspaceInfoContext.Provider value={activeWorkspace}>
                      <ScopeIdContext.Provider value={scopeId}>
                        <ScopeUpdater />
                        {children}
                      </ScopeIdContext.Provider>
                    </WorkspaceInfoContext.Provider>
                  </AwarenessContext.Provider>
                </RefetchScopesCallbackContext.Provider>
              </RawBearerContext.Provider>
            </ScopesContext.Provider>
          </DocContext.Provider>
        </SyncReadyContext.Provider>
      </div>
    </>
  )
}
