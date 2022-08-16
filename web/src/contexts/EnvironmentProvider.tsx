import { createContext, useEffect, useState, useContext } from 'react'

import { useReactiveVar } from '@apollo/client'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { activeEnvironmentVar } from './reactives'

// Doesn't appear to work so commenting out for now
//const ActiveEnvironmentContext = createContext({})
//export const useActiveEnvironment = () => useContext(ActiveEnvironmentContext)

const ActiveEnvironmentYMapContext = createContext(new Y.Map())
export const useActiveEnvironmentYMap = () =>
  useContext(ActiveEnvironmentYMapContext)

const EnvironmentsContext = createContext({})
export const useEnvironments = () => useContext(EnvironmentsContext)

const EnvironmentsYMapContext = createContext(null)
export const useEnvironmentsYMap = () => useContext(EnvironmentsYMapContext)

const BranchYMapContext = createContext<Y.Map<any> | null>(null)
export const useBranchYMap = () => useContext(BranchYMapContext)

type EnvironmentProviderProps = {
  branchYMap: Y.Map<any>
  children?: React.ReactNode
}

export const EnvironmentProvider = ({
  branchYMap,
  children,
}: EnvironmentProviderProps) => {
  const environmentsYMap = branchYMap?.get('environments')
  const allActiveEnvironmentsDict = useReactiveVar(activeEnvironmentVar)

  const environments = useYMap(environmentsYMap || new Y.Map())

  useEffect(() => {
    // Set activeEnvironmentYMap based on activeEnvironmentId
    const activeEnvironmentId =
      allActiveEnvironmentsDict[branchYMap?.get('id')] || null
    const activeEnvironmentYMap = activeEnvironmentId
      ? environmentsYMap?.get(activeEnvironmentId)
      : null
    setActiveEnvironmentYMap(activeEnvironmentYMap)
  }, [allActiveEnvironmentsDict, branchYMap, environmentsYMap])

  const [activeEnvironmentYMap, setActiveEnvironmentYMap] = useState<
    Y.Map<any>
  >(new Y.Map())

  const environment = useYMap(activeEnvironmentYMap || new Y.Map())

  return (
    <BranchYMapContext.Provider value={branchYMap}>
      <ActiveEnvironmentYMapContext.Provider value={activeEnvironmentYMap}>
        <EnvironmentsContext.Provider value={environments}>
          <EnvironmentsYMapContext.Provider value={environmentsYMap}>
            {children}
          </EnvironmentsYMapContext.Provider>
        </EnvironmentsContext.Provider>
      </ActiveEnvironmentYMapContext.Provider>
    </BranchYMapContext.Provider>
  )
}
