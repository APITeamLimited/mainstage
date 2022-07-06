import { useContext } from 'react'

import { ActiveWorkspaceContext } from '../contexts/active-workspace-context'
import type { WorkspaceContextValue } from '../contexts/active-workspace-context'

export const useActiveWorkspace = (): WorkspaceContextValue =>
  useContext(ActiveWorkspaceContext)
