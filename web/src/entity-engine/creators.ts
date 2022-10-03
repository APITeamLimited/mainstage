import { v4 as uuid } from 'uuid'
import type { Doc as YDoc } from 'yjs'

import type { YJSModule } from 'src/contexts/imports'

/**
 * populates an open doc with the necessary projects folder
 */
export const populateOpenDoc = (doc: YDoc) => {
  // See if the scope has a projects folder

  //const projectsFolder = doc.getMap('projects')

  // /if (projectsFolder.size === 0) {
  // /  const { project, id } = createProject('My First Project')
  // /  projectsFolder.set(id, project)
  // /}

  const rootMap = doc.getMap()
  rootMap.set('performedFirstRun', true)

  // Will be used in future to handle upgrades in YJS
  rootMap.set('schemaVersion', 0)
}

export const createProject = (name: string, Y: YJSModule) => {
  // Make the project a y doc to enable historical project data
  const project = new Y.Map()
  const id = uuid()

  project.set('id', id)
  project.set('name', name)
  project.set('createdAt', new Date().toISOString())
  project.set('updatedAt', null)

  const branches = new Y.Map()
  const { branch, branchId } = createBranch('main', Y)
  branches.set(branchId, branch)
  project.set('branches', branches)
  project.set('__typename', 'Project')

  return { project, id }
}

const createBranch = (name: string, Y: YJSModule) => {
  const branch = new Y.Map()

  const id = uuid()

  branch.set('id', id)
  branch.set('name', name)
  branch.set('createdAt', new Date().toISOString())
  branch.set('updatedAt', null)

  const collections = new Y.Map()
  const { collection, collectionId } = createCollection('New Collection', Y)
  collections.set(collectionId, collection)
  branch.set('collections', collections)

  branch.set('environments', new Y.Map())
  branch.set('__typename', 'Branch')

  return { branch, branchId: id }
}

export const createCollection = (name: string, Y: YJSModule) => {
  const collection = new Y.Map()

  const id = uuid()
  collection.set('name', name)
  collection.set('id', id)
  collection.set('createdAt', new Date().toISOString())
  collection.set('updatedAt', null)
  collection.set('folders', new Y.Map())
  collection.set('restRequests', new Y.Map())
  collection.set('restResponses', new Y.Map())
  collection.set('__typename', 'Collection')
  collection.set('description', '')
  collection.set('auth', {
    authType: 'none',
  })
  collection.set('variables', [])

  return { collection, collectionId: id }
}

export const createEnvironment = (name: string, Y: YJSModule) => {
  const environment = new Y.Map()

  const id = uuid()
  environment.set('name', name)
  environment.set('id', id)
  environment.set('createdAt', new Date().toISOString())
  environment.set('updatedAt', null)
  environment.set('__typename', 'Environment')
  environment.set('variables', [])

  return { environment, environmentId: id }
}

export const createFolder = ({
  name = 'New Folder',
  parentId,
  __parentTypename,
  orderingIndex,
  Y,
}: {
  name?: string
  parentId: string
  __parentTypename: string
  orderingIndex: number
  Y: YJSModule
}) => {
  const id = uuid()
  const folder = new Y.Map()
  folder.set('id', id)
  folder.set('name', name)
  folder.set('orderingIndex', orderingIndex)
  folder.set('createdAt', new Date().toISOString())
  folder.set('updatedAt', null)
  folder.set('__typename', 'Folder')
  folder.set('parentId', parentId)
  folder.set('__parentTypename', __parentTypename)
  folder.set('description', '')
  folder.set('auth', {
    authType: 'inherit',
  })

  return { folder, id }
}

export const createRestRequest = ({
  name = 'New Request',
  parentId,
  __parentTypename,
  orderingIndex,
  Y,
}: {
  name?: string
  parentId: string
  __parentTypename: string
  orderingIndex: number
  Y: YJSModule
}) => {
  const id = uuid()
  const request = new Y.Map()
  request.set('id', id)
  request.set('name', name)
  request.set('orderingIndex', orderingIndex)
  request.set('createdAt', new Date().toISOString())
  request.set('updatedAt', null)
  request.set('__typename', 'RESTRequest')
  request.set('parentId', parentId)
  request.set('__parentTypename', 'Collection')
  request.set('method', 'GET')
  request.set('endpoint', '')
  request.set('headers', [])
  request.set('params', [])
  request.set('body', {
    contentType: 'none',
    body: null,
  })
  request.set('auth', {
    authType: 'none',
  })
  request.set('description', '')

  return { request, id }
}
