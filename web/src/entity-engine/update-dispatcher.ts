import { Workspace } from 'types/src'
import * as Y from 'yjs'

import {
  activeEnvironmentVar,
  localRESTResponsesVar,
} from 'src/contexts/reactives'

import { populateOpenDoc } from '../../../entity-engine/src/entities'

import { PossibleSyncStatus } from './utils'

export type UpdateDispatcherArgs = {
  doc: Y.Doc
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
    localRESTResponsesVar([])
    activeEnvironmentVar({})
  }

  const rootMap = doc.getMap()

  const isLocal = !activeWorkspace.planInfo.remote

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
