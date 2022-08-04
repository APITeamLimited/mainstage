import { GetBearerPubkeyScopes } from 'types/graphql'
import { Workspace } from 'types/src'
import { IndexeddbPersistence } from 'y-indexeddb'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

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
}: HandleProvidersArgs) => {
  const { socketioProviderReady, indexeddbProviderReady } = ready

  // Close the providers if they should not be operational

  if (!socketioProviderReady && socketioProvider) {
    socketioProvider.destroy()
    setSocketioProvider(null)
    console.log('closed socketio provider')
    setSocketioSyncStatus('disabled')
  }

  if (!indexeddbProviderReady && indexeddbProvider) {
    indexeddbProvider.destroy()
    setIndexeddbProvider(null)
    setIndexeddbSyncStatus('disabled')
  }

  if (!socketioProviderReady && !indexeddbProviderReady) return

  if (!activeWorkspace) throw 'No active workspace'
  const isLocal = activeWorkspace.planInfo.type === 'LOCAL'

  const activeGUID = isLocal
    ? activeWorkspace.id
    : scopes.find((scope) => scope.variantTargetId === activeWorkspace.id)?.id

  if (!activeGUID) {
    throw `No GUID could be found for workspace ${activeWorkspace.id}`
  }

  const newDoc = getNewDoc(doc, setDoc, activeGUID)
  const guidChanged = doc?.guid !== activeGUID

  // Open the providers if they should be operational

  if (socketioProviderReady && (!socketioProvider || guidChanged)) {
    setSocketioProvider(
      new SocketIOProvider({
        scopeId: activeGUID,
        rawBearer: rawBearer || '',
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
    )
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
