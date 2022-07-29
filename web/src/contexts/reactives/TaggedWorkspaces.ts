import { makeVar } from '@apollo/client'
import { Workspace } from 'types/src'

// Used for storing info on available workspaces outside of EntityEngine context

const localWorkspace: Workspace = {
  __typename: 'Workspace',
  id: 'LOCAL_ID',
  name: 'Local Storage',
  planInfo: {
    type: 'LOCAL',
    remote: false,
    isTeam: false,
  },
  createdAt: new Date(),
  updatedAt: null,
}

export const defaultWorkspaces: Workspace[] = [localWorkspace]

export const activeWorkspaceIdVar = makeVar(localWorkspace.id)

export const workspacesVar = makeVar(defaultWorkspaces)
