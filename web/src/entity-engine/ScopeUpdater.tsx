import { useEffect, useState } from 'react'

import { Workspace } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

import { useRefetchScopesCallback } from './EntityEngine'

export const ScopeUpdater = () => {
  const refetchScopes = useRefetchScopesCallback()

  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)

  useEffect(
    () =>
      setActiveWorkspace(
        workspaces.find((workspace) => workspace.id === activeWorkspaceId) ||
          null
      ),
    [activeWorkspace, activeWorkspaceId, workspaces]
  )

  // Refetch scopes every 5 seconds
  useEffect(() => {
    const interval = setInterval(
      async () => refetchScopes?.(activeWorkspace?.scope.variantTargetId),
      5000
    )

    // On unmount clear interval
    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId])

  return <></>
}
