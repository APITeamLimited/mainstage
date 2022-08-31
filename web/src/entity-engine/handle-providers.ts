import { ApolloClient } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import { Workspace } from 'types/src'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

import { SocketIOProvider } from './socket-io-provider'
import { UpdateDispatcherArgs } from './update-dispatcher'
import { PossibleSyncStatus, ReadyStatus } from './utils'

type HandleProvidersArgs = {
  ready: ReadyStatus
  activeWorkspace: Workspace | null
  rawBearer: string | null
  scopes: GetBearerPubkeyScopes['scopes']
  doc: Y.Doc | null
  setDoc: (doc: Y.Doc | null) => void
  socketioProvider: SocketIOProvider | null
  setSocketioProvider: (socketioProvider: SocketIOProvider | null) => void
  indexeddbProvider: IndexeddbPersistence | null
  setIndexeddbProvider: (indexeddbProvider: IndexeddbPersistence | null) => void
  setSocketioSyncStatus: (syncStatus: PossibleSyncStatus) => void
  setIndexeddbSyncStatus: (syncStatus: PossibleSyncStatus) => void
  handleUpdateDispatch: (args: HandleUpdateDispatchArgs) => void
  apolloClient: ApolloClient<unknown>
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
  apolloClient,
}: HandleProvidersArgs) => {
  const { socketioProviderReady, indexeddbProviderReady } = ready

  // Close the providers if they should not be operational

  //if (socketioProvider) {
  //  console.log('socketioProvider exists')
  //  socketioProvider.disconnect()
  //  socketioProvider.destroy()
  //}

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
    console.log('guid changed', socketioProvider)
    socketioProvider?.disconnect()
    socketioProvider?.destroy()
    socketioProvider = null
  }

  const newDoc = getNewDoc(doc, setDoc, activeGUID)

  // Open the providers if they should be operational

  const newSocketIOInstance = () => {
    console.log(
      'newSocketIOInstance',
      activeWorkspace,
      guidChanged,
      socketioProvider
    )
    if (socketioProvider) {
      socketioProvider = null
      //setSocketioProvider(null)
    }

    return new SocketIOProvider({
      scopeId,
      rawBearer: rawBearer || '',
      apolloClient,
      doc: newDoc,
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
        },
        resyncInterval: -1,
      },
    })
  }

  if (socketioProviderReady && (!socketioProvider || guidChanged)) {
    setSocketioProvider(newSocketIOInstance())
    setSocketioSyncStatus('connecting')
  }

  if (indexeddbProviderReady && (!indexeddbProvider || guidChanged)) {
    const newIndexeddbProvider = new IndexeddbPersistence(activeGUID, newDoc)

    newIndexeddbProvider.on('synced', () => {
      setIndexeddbSyncStatus('connected')
    })

    setIndexeddbProvider(newIndexeddbProvider)
    setIndexeddbSyncStatus('connecting')
  }

  newDoc.autoLoad = true

  handleUpdateDispatch({
    doc: newDoc,
    activeWorkspace,
    initial: guidChanged,
  })
}

const getNewDoc = (
  oldDoc: Y.Doc | null,
  setDoc: (doc: Y.Doc) => void,
  activeGUID: string
) => {
  if (oldDoc === null || oldDoc.guid !== activeGUID) {
    const newDoc = new Y.Doc({ guid: activeGUID })
    setDoc(newDoc)
    return newDoc
  }

  return oldDoc
}

export type HandleUpdateDispatchArgs = Omit<
  UpdateDispatcherArgs,
  'socketioSyncStatus' | 'indexeddbSyncStatus'
>
