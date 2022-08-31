import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'

import { localEnvironmentsVar } from './locals'

import { activeEnvironmentVar, activeWorkspaceIdVar } from '.'

export const ReactiveVarPersistor = () => {
  const [performedStartup, setPerformedStartup] = useState(false)

  // The reactive variables we want to persist
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)

  // If we haven't performed the startup yet, get persisted variables from local storage
  /*useEffect(() => {
    if (!performedStartup) {
      const persistedWorkspaceId = localStorage.getItem('activeWorkspaceId')
      activeWorkspaceIdVar(
        persistedWorkspaceId === '' ? null : persistedWorkspaceId || ''
      )

      setPerformedStartup(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performedStartup])

  // If any of the reactive variables change, persist them to local storage*/

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId)
    }
  }, [activeWorkspaceId])

  return null
}
