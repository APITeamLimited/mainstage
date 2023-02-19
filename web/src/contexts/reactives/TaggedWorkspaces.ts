import { Workspace } from '@apiteam/types'
import { makeVar } from '@apollo/client'

// Used for storing info on available workspaces outside of EntityEngine context

export const defaultWorkspaces: Workspace[] = []

export const activeWorkspaceIdVar = makeVar<string | null>(null)

export const workspacesVar = makeVar(defaultWorkspaces)
