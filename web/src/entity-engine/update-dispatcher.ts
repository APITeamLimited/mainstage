import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { populateOpenDoc } from '../../../entity-engine/src/entities'

import {
  activeEnvironmentVar,
  localRESTResponsesVar,
} from 'src/contexts/reactives'

import { PossibleSyncStatus } from './utils'

import { Workspace } from 'types/src'

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
