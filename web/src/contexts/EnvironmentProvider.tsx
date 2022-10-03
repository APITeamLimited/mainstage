import { createContext, useEffect, useState, useContext } from 'react'

import { useReactiveVar } from '@apollo/client'
import type { Map as YMap } from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useYJSModule } from './imports'
import { activeEnvironmentVar, getBranchEnvironmentKey } from './reactives'

// Doesn't appear to work so commenting out for now
//const ActiveEnvironmentContext = createContext({})
//export const useActiveEnvironment = () => useContext(ActiveEnvironmentContext)

const ActiveEnvironmentYMapContext = createContext<YMap<any> | null>(null)
export const useActiveEnvironmentYMap = () =>
  useContext(ActiveEnvironmentYMapContext)

const EnvironmentsContext = createContext({})
export const useEnvironments = () => useContext(EnvironmentsContext)

const EnvironmentsYMapContext = createContext<YMap<any>>(null)
export const useEnvironmentsYMap = () => useContext(EnvironmentsYMapContext)

const BranchYMapContext = createContext<YMap<any>>(null)
export const useBranchYMap = () => useContext(BranchYMapContext)

type EnvironmentProviderProps = {
  branchYMap: YMap<any>
  children?: React.ReactNode
}

export const EnvironmentProvider = ({
  branchYMap,
  children,
}: EnvironmentProviderProps) => {
  const Y = useYJSModule()
  const environmentsYMap = branchYMap?.get('environments')
  const allActiveEnvironmentsDict = useReactiveVar(activeEnvironmentVar)

  const environments = useYMap(environmentsYMap || new Y.Map())

  useEffect(() => {
    // Set activeEnvironmentYMap based on activeEnvironmentId
    const activeEnvironmentId =
      allActiveEnvironmentsDict[getBranchEnvironmentKey(branchYMap)] || null
    const activeEnvironmentYMap = activeEnvironmentId
      ? environmentsYMap?.get(activeEnvironmentId)
      : null
    setActiveEnvironmentYMap(activeEnvironmentYMap)
  }, [allActiveEnvironmentsDict, branchYMap, environmentsYMap])

  const [activeEnvironmentYMap, setActiveEnvironmentYMap] = useState<YMap<any>>(
    new Y.Map()
  )

  useYMap(activeEnvironmentYMap || new Y.Map())

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
