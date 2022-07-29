import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'

import { localEnvironmentsVar } from './locals'

import { activeEnvironmentVar } from '.'

export const ReactiveVarPersistor = () => {
  const [performedStartup, setPerformedStartup] = useState(false)

  // The reactive variables we want to persist
  const localEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeUserBranchEnvironments = useReactiveVar(activeEnvironmentVar)

  // If we haven't performed the startup yet, get persisted variables from local storage
  useEffect(() => {
    if (!performedStartup) {
      const persistedLocalEnvironments =
        localStorage.getItem('localEnvironments')
      const persistedActiveUserBranchEnvironments = localStorage.getItem(
        'activeUserBranchEnvironments'
      )

      localEnvironmentsVar(
        JSON.parse(persistedLocalEnvironments || '[]').map((environment) => ({
          ...environment,
          updatedAt: isNaN(Date.parse(environment.updatedAt))
            ? null
            : Date.parse(environment.updatedAt),
          createdAt: Date.parse(environment.createdAt),
        }))
      )

      activeEnvironmentVar(
        JSON.parse(persistedActiveUserBranchEnvironments || '{}')
      )

      setPerformedStartup(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performedStartup])

  // If any of the reactive variables change, persist them to local storage

  useEffect(() => {
    localStorage.setItem(
      'localEnvironments',
      JSON.stringify(
        localEnvironments.map((environment) => {
          return {
            ...environment,
            updatedAt: environment.updatedAt
              ? new Date(environment.updatedAt).toISOString()
              : null,
            createdAt: new Date(environment.createdAt).toISOString(),
          }
        })
      )
    )
  }, [localEnvironments])

  useEffect(() => {
    localStorage.setItem(
      'activeUserBranchEnvironments',
      JSON.stringify(activeUserBranchEnvironments || {})
    )
  }, [activeUserBranchEnvironments])

  return null
}
