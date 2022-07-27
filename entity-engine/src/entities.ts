import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

export type PlanInfo =
  | {
      type: 'LOCAL'
    }
  | {
      type: 'FREE'
      isTeam: boolean
    }
  | {
      type: 'PRO'
      isTeam: boolean
    }
  | {
      type: 'ENTERPRISE'
      isTeam: true
    }

/**
 * populates an open doc with the necessary projects folder
 */
export const populateOpenDoc = (doc: Y.Doc, planInfo: PlanInfo) => {
  // See if the scope has a projects folder

  const projectsFolder = doc.getMap('projects')
  console.log('projectsFolder', projectsFolder.size)

  if (projectsFolder.size === 0) {
    const { project, id } = createProject('My First Project')
    projectsFolder.set(id, project)
  }

  const rootMap = doc.getMap()
  rootMap.set('performedFirstRun', true)
  rootMap.set('planInfo', planInfo)

  // Will be used in future to handle upgrades in YJS
  rootMap.set('schemaVersion', 0)

  console.log('populateOpenDoc complete')
}

const createProject = (name: string) => {
  // Make the project a y doc to enable historical project data
  const project = new Y.Map()
  const id = uuid()

  project.set('id', id)
  project.set('name', name)
  project.set('createdAt', new Date().toISOString())
  project.set('updatedAt', null)

  const branches = new Y.Map()
  const { branch, branchId } = createBranch('main')
  branches.set(branchId, branch)
  project.set('branches', branches)

  return { project, id }
}

const createBranch = (name: string) => {
  const branch = new Y.Map()

  const id = uuid()

  branch.set('id', id)
  branch.set('name', name)
  branch.set('createdAt', new Date().toISOString())
  branch.set('updatedAt', null)
  branch.set('resources', createIntialResources())

  return { branch, branchId: id }
}

export const createIntialResources = (blank = false) => {
  const resources = new Y.Map()

  const id = uuid()
  resources.set('id', id)

  const collections = new Y.Map()

  if (!blank) {
    const { collection, collectionId } = createCollection('My First Collection')
    collections.set(collectionId, collection)
  }

  resources.set('collections', collections)

  const environments = new Y.Map()
  resources.set('environments', environments)

  return resources
}

const createCollection = (name: string) => {
  const collection = new Y.Map()

  const id = uuid()
  collection.set('name', name)
  collection.set('id', id)
  collection.set('createdAt', new Date().toISOString())
  collection.set('updatedAt', null)
  collection.set('folders', new Y.Array())
  collection.set('restRequests', new Y.Array())
  collection.set('restResponses', new Y.Array())

  return { collection, collectionId: id }
}
