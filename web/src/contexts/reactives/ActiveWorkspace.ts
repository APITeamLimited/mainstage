import { makeVar } from '@apollo/client'

export type ActiveWorkspace = {
  __typename: 'Team' | 'User' | 'Anonymous'
  id: string | 'ANONYMOUS_ID'
  name: string
}

export const anonymousWorkspace: ActiveWorkspace = {
  __typename: 'Anonymous',
  id: 'ANONYMOUS_ID',
  name: 'Local Storage',
}

export const activeWorkspaceVar = makeVar(anonymousWorkspace)
