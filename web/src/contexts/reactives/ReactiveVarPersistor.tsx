import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'

import { activeEnvironmentVar, activeWorkspaceIdVar } from '.'

export const ReactiveVarPersistor = () => {
  const [performedStartup, setPerformedStartup] = useState(false)

  // The reactive variables we want to persist
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  // If we haven't performed the startup yet, get persisted variables from local storage
  useEffect(() => {
    if (!performedStartup) {
      const persistedWorkspaceId = localStorage.getItem('activeWorkspaceId')
      activeWorkspaceIdVar(
        persistedWorkspaceId === '' ? null : persistedWorkspaceId || ''
      )

      const persistedEnvironmentDict = localStorage.getItem(
        'activeEnvironmentDict'
      )

      activeEnvironmentVar(
        (persistedEnvironmentDict === ('' || null)
          ? null
          : JSON.parse(persistedEnvironmentDict)) || {}
      )

      setPerformedStartup(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performedStartup])

  // If any of the reactive variables change, persist them to local storage*/

  useEffect(
    () => localStorage.setItem('activeWorkspaceId', activeWorkspaceId || ''),
    [activeWorkspaceId]
  )

  useEffect(
    () =>
      localStorage.setItem(
        'activeEnvironmentDict',
        JSON.stringify(activeEnvironmentDict)
      ),
    [activeEnvironmentDict]
  )

  return null
}
