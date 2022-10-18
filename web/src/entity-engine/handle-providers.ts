import { ClientAwareness, ServerAwareness, Workspace } from '@apiteam/types/src'
import { ApolloClient } from '@apollo/client'
import { GetBearerPubkeyScopes } from 'types/graphql'
import type { Doc as YDoc } from 'yjs'

import type { Lib0Module, YJSModule } from 'src/contexts/imports'

import { SocketIOProvider } from './socket-io-provider'
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
  activeWorkspace,
  rawBearer,
  scopes,
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
      scopeId,
      rawBearer: rawBearer || '',
      apolloClient,
      doc,
      Y,
      lib0,
      options: {
        onStatusChange: (status, doc) => {
          doc.load()

          setSocketioSyncStatus(status)

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

        // Doesn't always sync correctly the first time
        resyncInterval: 1000,
      },
    })
  }

  if (
    socketioProviderReady &&
    (!socketioProvider || guidChanged) // &&
    //socketioSyncStatus !== 'connecting'
  ) {
    socketioProvider?.disconnect()
    socketioProvider?.destroy()
    socketioProvider = null

    setSpawnKey(Math.random().toString(36).substring(10))
    setSocketioProvider(newSocketIOInstance(newDoc, Y))
    setSocketioSyncStatus('connecting')
  }
}
