import { createContext, useContext, useMemo } from 'react'

import type { ExecutionParams } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'

import { activeEnvironmentVar } from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'
import { createEnvironmentContext } from 'src/utils/environment'

import { useCollection } from './collection'
import { useActiveEnvironmentYMap } from './EnvironmentProvider'
import { useYJSModule } from './imports'

// Store memoised calulation for environment and collection contexts
const CollectionVariablesContext =
  createContext<ExecutionParams['collectionContext']>(null)

export const useCollectionVariables = () =>
  useContext(CollectionVariablesContext)

const EnvironmentVariablesContext =
  createContext<ExecutionParams['environmentContext']>(null)

export const useEnvironmentVariables = () =>
  useContext(EnvironmentVariablesContext)

type VariablesProviderProps = {
  children?: React.ReactNode
}

export const VariablesProvider = ({ children }: VariablesProviderProps) => {
  const Y = useYJSModule()

  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const environmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())

  const collectionYMap = useCollection()
  const collectionHook = useYMap(collectionYMap ?? new Y.Map())

  const collectionVariables = useMemo(
    () => {
      if (!collectionYMap) return null
      const workspaceId = collectionYMap.doc?.guid as string | undefined
      if (!workspaceId) return null
      return createEnvironmentContext(collectionYMap, workspaceId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionHook]
  )

  const environmentVariables = useMemo(
    () => {
      if (!activeEnvironmentYMap) return null
      const workspaceId = activeEnvironmentYMap.doc?.guid as string | undefined
      if (!workspaceId) return null
      return createEnvironmentContext(activeEnvironmentYMap, workspaceId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEnvironmentDict, environmentHook]
  )

  return (
    <CollectionVariablesContext.Provider value={collectionVariables}>
      <EnvironmentVariablesContext.Provider value={environmentVariables}>
        {children}
      </EnvironmentVariablesContext.Provider>
    </CollectionVariablesContext.Provider>
  )
}
