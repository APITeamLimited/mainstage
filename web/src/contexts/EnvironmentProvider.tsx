/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useEffect, useState, useContext } from 'react'

import { useReactiveVar } from '@apollo/client'
import type { Map as YMap } from 'yjs'

import { useYMap } from 'src/lib/zustand-yjs'

import { useYJSModule } from './imports'
import { activeEnvironmentVar, getBranchEnvironmentKey } from './reactives'

const ActiveEnvironmentYMapContext = createContext<YMap<any> | null>(null)
export const useActiveEnvironmentYMap = () =>
  useContext(ActiveEnvironmentYMapContext)

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

  const environmentsHook = useYMap(environmentsYMap || new Y.Map())

  useEffect(() => {
    // Set activeEnvironmentYMap based on activeEnvironmentId
    const activeEnvironmentId =
      allActiveEnvironmentsDict[getBranchEnvironmentKey(branchYMap)] || null
    const activeEnvironmentYMap = activeEnvironmentId
      ? environmentsYMap?.get(activeEnvironmentId)
      : null

    setActiveEnvironmentYMap(activeEnvironmentYMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allActiveEnvironmentsDict, environmentsHook])

  const [activeEnvironmentYMap, setActiveEnvironmentYMap] = useState<YMap<any>>(
    new Y.Map()
  )

  useYMap(activeEnvironmentYMap || new Y.Map())

  return (
    <BranchYMapContext.Provider value={branchYMap}>
      <ActiveEnvironmentYMapContext.Provider value={activeEnvironmentYMap}>
        <EnvironmentsYMapContext.Provider value={environmentsYMap}>
          {children}
        </EnvironmentsYMapContext.Provider>
      </ActiveEnvironmentYMapContext.Provider>
    </BranchYMapContext.Provider>
  )
}
