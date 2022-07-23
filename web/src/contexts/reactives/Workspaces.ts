import { makeVar } from '@apollo/client'

export type Workspace = {
  __typename: 'Team' | 'User' | 'Local'
  id: string | 'LOCAL_ID'
  name: string
}

export const anonymousWorkspace: Workspace = {
  __typename: 'Local',
  id: 'LOCAL_ID',
  name: 'Local Storage',
}

export const defaultWorkspaces: Workspace[] = [anonymousWorkspace]

export const activeWorkspaceIdVar = makeVar(anonymousWorkspace.id)

export const workspacesVar = makeVar(defaultWorkspaces)
