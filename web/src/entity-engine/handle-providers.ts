import { ClientAwareness, ServerAwareness } from '@apiteam/types/src'
import { ApolloClient } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import type { Doc as YDoc } from 'yjs'

import type { Lib0Module, YJSModule } from 'src/contexts/imports'

import { SocketIOProvider } from './socket-io-provider'
import { PossibleSyncStatus, ReadyStatus } from './utils'

type HandleProvidersArgs = {
  ready: ReadyStatus
  rawBearer: string | null
  activeScope: GetBearerPubkeyScopes['scopes'][number]
  doc: YDoc | null
  setDoc: (doc: YDoc | null) => void
  socketioProvider: SocketIOProvider | null
  setSocketioProvider: (socketioProvider: SocketIOProvider | null) => void
  setSocketioSyncStatus: (syncStatus: PossibleSyncStatus) => void
  setAwareness: (newAwareness: ServerAwareness) => void
  apolloClient: ApolloClient<unknown>
  Y: YJSModule
  lib0: Lib0Module
  socketioSyncStatus: PossibleSyncStatus
  setSpawnKey: (spawnKey: string) => void
}

export const handleProviders = ({
  ready,
  rawBearer,
  activeScope,
  doc,
  setDoc,
  socketioProvider,
  setSocketioProvider,
  setSocketioSyncStatus,
  setAwareness,
  apolloClient,
  setSpawnKey,
  Y,
  lib0,
}: HandleProvidersArgs) => {
  const { socketioProviderReady } = ready

  // Close the providers if they should not be operational
  if (!socketioProviderReady && socketioProvider) {
    socketioProvider.disconnect()
    socketioProvider.destroy()
  }

  if (!socketioProviderReady) return

  const activeGUID = `${activeScope.variant}:${activeScope.variantTargetId}`

  const guidChanged = doc?.guid !== activeGUID

  const getNewDoc = (
    oldDoc: YDoc | null,
    setDoc: (doc: YDoc) => void,
    activeGUID: string
  ) => {
    if (oldDoc === null || oldDoc.guid !== activeGUID) {
      const newDoc = new Y.Doc({ guid: activeGUID, autoLoad: true })
      newDoc.load()
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
      scopeId: activeScope.id,
      rawBearer: rawBearer || '',
      apolloClient,
      doc,
      Y,
      lib0,
      options: {
        onStatusChange: (status, doc) => {
          doc.load()
          setSocketioSyncStatus(status)
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

        // Doesn't always sync correctly the first time
        resyncInterval: 1000,
      },
    })
  }

  if (socketioProviderReady && (!socketioProvider || guidChanged)) {
    socketioProvider?.disconnect()
    socketioProvider?.destroy()
    socketioProvider = null

    setSpawnKey(Math.random().toString(36).substring(10))
    setSocketioProvider(newSocketIOInstance(newDoc, Y))
    setSocketioSyncStatus('connecting')
  }
}
