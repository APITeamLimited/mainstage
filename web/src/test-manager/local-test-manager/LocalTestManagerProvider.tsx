import { useEffect, useState, createContext, useContext } from 'react'

import { useReactiveVar } from '@apollo/client'

import { focusedResponseVar } from 'src/contexts/focused-response'
import { useWorkspace } from 'src/entity-engine'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'

import { LocalManagerInterface, LocalTestManager } from './local-test-manager'

const LocalTestManagerContext = createContext<LocalManagerInterface>(null)
export const useLocalTestManager = () => useContext(LocalTestManagerContext)

type LocalTestManagerProviderProps = {
  children?: React.ReactNode
}

export const LocalTestManagerProvider = ({
  children,
}: LocalTestManagerProviderProps) => {
  const [localManager, setLocalManager] = useState<LocalTestManager | null>(
    null
  )

  const workspace = useWorkspace()
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const [localManagerInterface, setLocalManagerInterface] =
    useState<LocalManagerInterface>(null)

  useEffect(() => {
    const manager = new LocalTestManager({
      onManagerUpdate: setLocalManagerInterface,
      scopeId,
      rawBearer,
      workspace,
      focusedResponseDict,
    })
    setLocalManager(manager)

    return () => {
      manager.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (localManager) {
      localManager.setScopeId(scopeId)
    }
  }, [localManager, scopeId])

  useEffect(() => {
    if (localManager) {
      localManager.setRawBearer(rawBearer)
    }
  }, [localManager, rawBearer])

  useEffect(() => {
    if (localManager) {
      localManager.setFocusedResponseDict(focusedResponseDict)
    }
  }, [localManager, focusedResponseDict])

  return (
    <LocalTestManagerContext.Provider value={localManagerInterface}>
      {children}
    </LocalTestManagerContext.Provider>
  )
}
