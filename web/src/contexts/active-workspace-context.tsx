import { createContext, FC, ReactNode, useEffect, useState } from 'react'

export interface ActiveWorkspace {
  __typename: 'Team' | 'User' | 'Anonymous'
  id: string | 'ANONYMOUS_ID'
  name: string
}

export interface WorkspaceContextValue {
  workspace: ActiveWorkspace
  setWorkspace: (newWorkspace: ActiveWorkspace) => void
}

interface WorkspaceProviderProps {
  children?: ReactNode
}

export const anonymousWorkspace: ActiveWorkspace = {
  __typename: 'Anonymous',
  id: 'ANONYMOUS_ID',
  name: 'Local Storage',
}

export const restoreActiveWorkspace = (): ActiveWorkspace | null => {
  let workspace = null

  try {
    const storedData: string | null =
      globalThis.localStorage.getItem('actveWorkspace') || null

    if (storedData) {
      workspace = JSON.parse(storedData)
    } else {
      workspace = anonymousWorkspace
    }
  } catch (err) {
    console.error(err)
    // If stored data is not a strigified JSON this will fail,
    // that's why we catch the error
  }

  return workspace
}

export const ActiveWorkspaceContext = createContext<WorkspaceContextValue>({
  workspace: anonymousWorkspace,
  setWorkspace: () => {},
})

export const storeActiveWorkspace = (workspace: ActiveWorkspace): void => {
  globalThis.localStorage.setItem('actveWorkspace', JSON.stringify(workspace))
}

export const WorkspaceProvider: FC<WorkspaceProviderProps> = (props) => {
  const { children } = props
  const [workspace, setWorkspace] =
    useState<ActiveWorkspace>(anonymousWorkspace)

  useEffect(() => {
    const restoredWorkspace = restoreActiveWorkspace()

    if (restoredWorkspace) {
      setWorkspace(restoredWorkspace)
    }
  }, [])

  const saveActiveWorkspace = (updatedWorkspace: ActiveWorkspace): void => {
    setWorkspace(updatedWorkspace)
    storeActiveWorkspace(updatedWorkspace)
  }

  return (
    <ActiveWorkspaceContext.Provider
      value={{ workspace, setWorkspace: saveActiveWorkspace }}
    >
      {children}
    </ActiveWorkspaceContext.Provider>
  )
}

WorkspaceProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const WorkspaceConsumer = ActiveWorkspaceContext.Consumer
