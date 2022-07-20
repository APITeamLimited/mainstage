import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'

import {
  localProjectsVar,
  localCollectionsVar,
  localFoldersVar,
  localRESTRequestsVar,
  localEnvironmentsVar,
} from './locals'

import { activeEnvironmentVar } from '.'

export const ReactiveVarPersistor = () => {
  const [performedStartup, setPerformedStartup] = useState(false)

  // The reactive variables we want to persist
  const localProjects = useReactiveVar(localProjectsVar)
  const localCollections = useReactiveVar(localCollectionsVar)
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const localEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeEnvironmentId = useReactiveVar(activeEnvironmentVar)

  // If we haven't performed the startup yet, get persisted variables from local storage
  useEffect(() => {
    if (!performedStartup) {
      const persistedLocalProjects = localStorage.getItem('localProjects')
      const persistedLocalCollections = localStorage.getItem('localCollections')
      const persistedLocalFolders = localStorage.getItem('localFolders')
      const persistedLocalRESTRequests =
        localStorage.getItem('localRESTRequests')
      const persistedLocalEnvironments =
        localStorage.getItem('localEnvironments')
      const persistedActiveEnvironmentId = localStorage.getItem(
        'activeEnvironmentId'
      )

      localProjectsVar(
        JSON.parse(persistedLocalProjects || '[]').map((project) => {
          return {
            ...project,
            updatedAt: isNaN(Date.parse(project.updatedAt))
              ? null
              : Date.parse(project.updatedAt),
            createdAt: Date.parse(project.createdAt),
          }
        })
      )

      localCollectionsVar(
        JSON.parse(persistedLocalCollections || '[]').map((collection) => {
          return {
            ...collection,
            updatedAt: isNaN(Date.parse(collection.updatedAt))
              ? null
              : Date.parse(collection.updatedAt),
            createdAt: Date.parse(collection.createdAt),
          }
        })
      )

      localFoldersVar(
        JSON.parse(persistedLocalFolders || '[]').map((folder) => {
          return {
            ...folder,
            updatedAt: isNaN(Date.parse(folder.updatedAt))
              ? null
              : Date.parse(folder.updatedAt),
            createdAt: Date.parse(folder.createdAt),
          }
        })
      )

      localRESTRequestsVar(
        JSON.parse(persistedLocalRESTRequests || '[]').map((request) => {
          return {
            ...request,
            updatedAt: isNaN(Date.parse(request.updatedAt))
              ? null
              : Date.parse(request.updatedAt),
            createdAt: Date.parse(request.createdAt),
          }
        })
      )

      localEnvironmentsVar(
        JSON.parse(persistedLocalEnvironments || '[]').map((environment) => {
          return {
            ...environment,
            updatedAt: isNaN(Date.parse(environment.updatedAt))
              ? null
              : Date.parse(environment.updatedAt),
            createdAt: Date.parse(environment.createdAt),
          }
        })
      )

      activeEnvironmentVar(
        persistedActiveEnvironmentId !== 'null'
          ? persistedActiveEnvironmentId
          : null
      )

      setPerformedStartup(true)
    }
  }, [performedStartup])

  // If any of the reactive variables change, persist them to local storage

  useEffect(() => {
    localStorage.setItem(
      'localProjects',
      JSON.stringify(
        localProjects.map((project) => {
          return {
            ...project,
            updatedAt: project.updatedAt
              ? new Date(project.updatedAt).toISOString()
              : null,
            createdAt: new Date(project.createdAt).toISOString(),
          }
        })
      )
    )
  }, [localProjects])

  useEffect(() => {
    localStorage.setItem(
      'localCollections',
      JSON.stringify(
        localCollections.map((collection) => {
          return {
            ...collection,
            updatedAt: collection.updatedAt
              ? new Date(collection.updatedAt).toISOString()
              : null,
            createdAt: new Date(collection.createdAt).toISOString(),
          }
        })
      )
    )
  }, [localCollections])

  useEffect(() => {
    localStorage.setItem(
      'localFolders',
      JSON.stringify(
        localFolders.map((folder) => {
          return {
            ...folder,
            updatedAt: folder.updatedAt
              ? new Date(folder.updatedAt).toISOString()
              : null,
            createdAt: new Date(folder.createdAt).toISOString(),
          }
        })
      )
    )
  }, [localFolders])

  useEffect(() => {
    localStorage.setItem(
      'localRESTRequests',
      JSON.stringify(
        localRESTRequests.map((request) => {
          return {
            ...request,
            updatedAt: request.updatedAt
              ? new Date(request.updatedAt).toISOString()
              : null,
            createdAt: new Date(request.createdAt).toISOString(),
          }
        })
      )
    )
  }, [localRESTRequests])

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
    localStorage.setItem('activeEnvironmentId', activeEnvironmentId || 'null')
  }, [activeEnvironmentId])

  return null
}
