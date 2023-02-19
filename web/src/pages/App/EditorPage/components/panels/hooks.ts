import { useMemo, useState } from 'react'

import {
  DEFAULT_EXECUTION_OPTIONS,
  ExecutionScript,
  safeGetExecutionOptions,
  BUILTIN_REST_SCRIPTS,
  BULTIN_MULTI_SCRIPTS,
} from '@apiteam/types'
import type { Map as YMap } from 'yjs'

export const getExecutionScripts = (yMap: YMap<any>, multimode: boolean) => {
  const builtIn = multimode ? BULTIN_MULTI_SCRIPTS : BUILTIN_REST_SCRIPTS

  // TODO: There is a glitch where unsaved data perists when script is closed,
  // re-serializing JSON seems to fix this

  if (yMap.get('executionScripts') !== undefined) {
    return [
      ...builtIn,
      ...JSON.parse(JSON.stringify(yMap.get('executionScripts'))),
    ]
  }

  yMap.set('executionScripts', [])

  return [
    ...builtIn,
    ...JSON.parse(JSON.stringify(yMap.get('executionScripts'))),
  ]
}

export const useUnsavedExecutionScripts = (
  yMap: YMap<any>,
  multimode: boolean
) => {
  const [unsavedExecutionScripts, setUnsavedExecutionScripts] = useState<
    ExecutionScript[]
  >(getExecutionScripts(yMap, multimode))

  const defaultExecutionScript = useMemo(
    () => unsavedExecutionScripts[0],
    [unsavedExecutionScripts]
  )

  return {
    unsavedExecutionScripts,
    setUnsavedExecutionScripts,
    defaultExecutionScript,
  }
}

export const getDescription = (yMap: YMap<any>): string => {
  // Empty string is falsy, so we need to check for undefined
  if (yMap.get('description') !== undefined) {
    return yMap.get('description')
  }

  yMap.set('description', '')
  return yMap.get('description')
}

export const useUnsavedDescription = (yMap: YMap<any>) => {
  const state = useState(getDescription(yMap))

  return state
}

export const getExecutionOptions = (yMap: YMap<any>) => {
  if (yMap.get('executionOptions') !== undefined) {
    return safeGetExecutionOptions(yMap.get('executionOptions'))
  }

  yMap.set('executionOptions', DEFAULT_EXECUTION_OPTIONS)
  return safeGetExecutionOptions(yMap.get('executionOptions'))
}

export const useUnsavedExecutionOptions = (yMap: YMap<any>) => {
  const state = useState(getExecutionOptions(yMap))

  return state
}
