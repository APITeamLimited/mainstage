import { useEffect, useState, createContext, useContext } from 'react'

import { LocalManagerInterface, LocalTestManager } from './local-test-manager'

const LocalTestManagerContext = createContext<LocalManagerInterface>(null)
export const useLocalTestManager = () => useContext(LocalTestManagerContext)

type LocalTestManagerProviderProps = {
  children?: React.ReactNode
}

export const LocalTestManagerProvider = ({
  children,
}: LocalTestManagerProviderProps) => {
  const [_, setLocalManager] = useState<LocalTestManager | null>(null)

  const [localManagerInterface, setLocalManagerInterface] =
    useState<LocalManagerInterface>(null)

  useEffect(() => {
    const manager = new LocalTestManager({
      onManagerUpdate: setLocalManagerInterface,
    })
    setLocalManager(manager)

    return () => {
      manager.destroy()
    }
  }, [])

  return (
    <LocalTestManagerContext.Provider value={localManagerInterface}>
      {children}
    </LocalTestManagerContext.Provider>
  )
}
