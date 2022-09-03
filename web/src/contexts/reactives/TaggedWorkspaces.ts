import { makeVar } from '@apollo/client'
import { Workspace } from '@apiteam/types'

// Used for storing info on available workspaces outside of EntityEngine context

const localWorkspace: Workspace = {
  __typename: 'Workspace',
  id: 'LOCAL_ID',
  name: 'Local Storage',
  remote: false,
  isTeam: false,
  createdAt: new Date(),
  updatedAt: null,
}

// TODO: Re-enable local workspaces when done cloud

//export const defaultWorkspaces: Workspace[] = [localWorkspace]

//export const activeWorkspaceIdVar = makeVar(localWorkspace.id)

//export const workspacesVar = makeVar(defaultWorkspaces)

export const defaultWorkspaces: Workspace[] = []

export const activeWorkspaceIdVar = makeVar<string | null>(null)

export const workspacesVar = makeVar(defaultWorkspaces)
