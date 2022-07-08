import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'

import { localProjectsVar, localCollectionsVar } from './locals'

export const ReactiveVarPersistor = () => {
  const [performedStartup, setPerformedStartup] = useState(false)

  // The reactive variables we want to persist
  const localProjects = useReactiveVar(localProjectsVar)
  const localCollections = useReactiveVar(localCollectionsVar)

  // If we haven't performed the startup yet, get persisted variables from local storage
  useEffect(() => {
    if (!performedStartup) {
      const persistedLocalProjects = localStorage.getItem('localProjects')
      const persistedLocalCollections = localStorage.getItem('localCollections')

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
  }, [localProjects, localCollections])

  return null
}
