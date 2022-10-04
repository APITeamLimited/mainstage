import { Workspace } from '@apiteam/types'
import type { Doc as YDoc } from 'yjs'

import { activeEnvironmentVar } from 'src/contexts/reactives'

import { PossibleSyncStatus } from './utils'

export type UpdateDispatcherArgs = {
  doc: YDoc
  activeWorkspace: Workspace
  initial?: boolean
  socketioSyncStatus: PossibleSyncStatus
  indexeddbSyncStatus: PossibleSyncStatus
}

export const updateDispatcher = ({
  doc,
  activeWorkspace,
  initial = false,
  socketioSyncStatus,
  indexeddbSyncStatus,
}: UpdateDispatcherArgs) => {
  // If is initial, then we clear the reactive variables
  if (initial) {
    activeEnvironmentVar({})
  }

  const rootMap = doc.getMap()

  const isLocal = !activeWorkspace.remote

  // Only perform first run formatting if local, remote ones are done in the backend
  // We also only want to run when synced and connected to prevent duplicate, formatting
  if (isLocal && indexeddbSyncStatus === 'connected') {
    const performedFirstRun = rootMap.get('performedFirstRun') === true

    if (!performedFirstRun) {
      //populateOpenDoc(doc, {
      //  type: 'LOCAL',
      //  remote: false,
      //  isTeam: false,
      //})
    }
  }
}
