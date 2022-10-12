import { ClientAwareness, ServerAwareness, Workspace } from '@apiteam/types/src'
import { ApolloClient } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import type { IndexeddbPersistence } from 'y-indexeddb'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import type { Lib0Module, YJSModule } from 'src/contexts/imports'

import { SocketIOProvider } from './socket-io-provider'
import { UpdateDispatcherArgs } from './update-dispatcher'
import { PossibleSyncStatus, ReadyStatus } from './utils'

type HandleProvidersArgs = {
  ready: ReadyStatus
  activeWorkspace: Workspace | null
  rawBearer: string | null
  scopes: GetBearerPubkeyScopes['scopes']
  doc: YDoc | null
  setDoc: (doc: YDoc | null) => void
  socketioProvider: SocketIOProvider | null
  setSocketioProvider: (socketioProvider: SocketIOProvider | null) => void
  indexeddbProvider: IndexeddbPersistence | null
  setIndexeddbProvider: (indexeddbProvider: IndexeddbPersistence | null) => void
  setSocketioSyncStatus: (syncStatus: PossibleSyncStatus) => void
  setIndexeddbSyncStatus: (syncStatus: PossibleSyncStatus) => void
  handleUpdateDispatch: (args: HandleUpdateDispatchArgs) => void
  setAwareness: (newAwareness: ServerAwareness) => void
  apolloClient: ApolloClient<unknown>
  Y: YJSModule
  lib0: Lib0Module
}

export const handleProviders = ({
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
  setAwareness,
  apolloClient,
  Y,
  lib0,
}: HandleProvidersArgs) => {
  const { socketioProviderReady, indexeddbProviderReady } = ready

  // Close the providers if they should not be operational
  if (!socketioProviderReady && socketioProvider) {
    socketioProvider.disconnect()
    socketioProvider.destroy()
  }

  if (!indexeddbProviderReady && indexeddbProvider) {
    indexeddbProvider.destroy()
    setIndexeddbProvider(null)
    setIndexeddbSyncStatus('disabled')
  }

  if (!socketioProviderReady && !indexeddbProviderReady) return

  if (!activeWorkspace) throw 'No active workspace'
  const isLocal = !activeWorkspace.remote

  let activeGUID = ''
  if (isLocal) {
    activeGUID = `LOCAL:${activeWorkspace.id}`
  } else {
    const scope = scopes.find(
      (scope) => scope.variantTargetId === activeWorkspace.id
    )
    if (!scope) throw 'No scope found for active workspace'
    activeGUID = `${scope.variant}:${scope.variantTargetId}`
  }

  const scopeId = isLocal
    ? activeWorkspace.id
    : scopes.find((scope) => scope.variantTargetId === activeWorkspace.id)?.id

  if (!scopeId) {
    throw `No scopeId could be found for workspace ${activeWorkspace.id}`
  }

  const guidChanged = doc?.guid !== activeGUID

  if (guidChanged) {
    socketioProvider?.disconnect()
    socketioProvider?.destroy()
    socketioProvider = null
  }

  const getNewDoc = (
    oldDoc: YDoc | null,
    setDoc: (doc: YDoc) => void,
    activeGUID: string
  ) => {
    if (oldDoc === null || oldDoc.guid !== activeGUID) {
      const newDoc = new Y.Doc({ guid: activeGUID })
      setDoc(newDoc)
      return newDoc
    }

    return oldDoc
  }

  const newDoc = getNewDoc(doc, setDoc, activeGUID)

  // Open the providers if they should be operational

  const newSocketIOInstance = (doc: YDoc, Y: YJSModule) => {
    if (socketioProvider) {
      socketioProvider = null
    }

    return new SocketIOProvider({
      scopeId,
      rawBearer: rawBearer || '',
      apolloClient,
      doc,
      Y,
      lib0,
      options: {
        //onAwarenessUpdate: (awareness) => {
        //  //console.log('awareness bing bing', awareness)
        //},
        onSyncMessage: (newDoc) =>
          handleUpdateDispatch({
            doc: newDoc,
            activeWorkspace,
          }),
        onStatusChange: (status) => {
          setSocketioSyncStatus(status)

          console.log('socketio status', status)

          // TODO: Causes an infinite loop when first connecting
          //if (status === 'disconnected') {
          //  // TODO: Come up with a better way to deal with rogue open docs
          //  setTimeout(() => {
          //    window.location.reload()
          //  }, 1000)
          //}
        },
        onAwarenessUpdate: (awareness) => {
          const statesArray = Array.from(awareness.getStates().values()) as (
            | ServerAwareness
            | ClientAwareness
          )[]
          const serverAwareness = statesArray?.filter(
            (client) => 'variant' in client
          ) as ServerAwareness[]

          if (serverAwareness.length === 0) throw 'No server awareness found'

          setAwareness(serverAwareness[0])
        },
        resyncInterval: -1,
      },
    })
  }

  if (socketioProviderReady && (!socketioProvider || guidChanged)) {
    setSocketioProvider(newSocketIOInstance(newDoc, Y))
    setSocketioSyncStatus('connecting')
  }

  if (indexeddbProviderReady && (!indexeddbProvider || guidChanged)) {
    const newIndexeddbProvider = new Y.indexeddb.IndexeddbPersistence(
      activeGUID,
      newDoc
    )

    newIndexeddbProvider.on('synced', () => {
      setIndexeddbSyncStatus('connected')
    })

    setIndexeddbProvider(newIndexeddbProvider)
    setIndexeddbSyncStatus('connecting')
  }

  handleUpdateDispatch({
    doc: newDoc,
    activeWorkspace,
    initial: guidChanged,
  })
}

export type HandleUpdateDispatchArgs = Omit<
  UpdateDispatcherArgs,
  'socketioSyncStatus' | 'indexeddbSyncStatus'
>
