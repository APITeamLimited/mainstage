import { GetBearerPubkeyScopes } from 'types/graphql'
import { IndexeddbPersistence } from 'y-indexeddb'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { Workspace } from 'src/contexts/reactives'

import { SocketIOProvider } from './socket-io-provider'
import { ReadyStatus } from './utils'

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
}: HandleProvidersArgs) => {
  const { socketioProviderReady, indexeddbProviderReady } = ready

  // Close the providers if they should not be operational

  if (!socketioProviderReady && socketioProvider) {
    socketioProvider.destroy()
    setSocketioProvider(null)
  }

  if (!indexeddbProviderReady && indexeddbProvider) {
    indexeddbProvider.destroy()
    setIndexeddbProvider(null)
  }

  if (!socketioProviderReady && !indexeddbProviderReady) return

  if (!activeWorkspace) throw 'No active workspace'
  const isLocal = activeWorkspace.__typename === 'Local'

  const activeGUID = isLocal
    ? activeWorkspace.id
    : scopes.find((scope) => scope.variantTargetId === activeWorkspace.id)?.id

  if (!activeGUID) {
    throw `No GUUID could be found for workspace ${activeWorkspace.id}`
  }

  const newDoc = getNewDoc(doc, setDoc, activeGUID)
  const guidChanged = newDoc.guid !== activeGUID

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
          onSyncMessage: () => {
            console.log('sync message', newDoc)
            const rootmap = newDoc.getMap()
            console.log(rootmap.get('count'))
          },
          resyncInterval: 1000,
        },
      })
    )
  }

  if (indexeddbProviderReady && (!indexeddbProvider || guidChanged)) {
    setIndexeddbProvider(new IndexeddbPersistence(activeGUID, newDoc))
  }
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
