import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { Scope } from '../../api/types/graphql'

/**
 * populates an open doc with the necessary projects folder
 */
export const populateOpenDoc = (scope: Scope, doc: Y.Doc) => {
  // See if the scope has a projects folder

  const projectsFolder = doc.getMap<Y.Doc>('projects')
  console.log('projectsFolder', projectsFolder.size)

  if (projectsFolder.size === 0) {
    console.log('Creating new projects folder')
    const firstProject = createProject('My First Project')
    projectsFolder.set(firstProject.guid, firstProject)
    console.log('Created new project', firstProject.guid)
  }

  console.log('populateOpenDoc complete', scope.id)
}

const createProject = (name: string) => {
  // Make the project a y doc to enable historical project data
  const project = new Y.Doc()
  const rootMap = project.getMap()

  const existingName = rootMap.get('name')
  if (!existingName) {
    rootMap.set('name', name)
  }

  const branchesFolder = rootMap.get('branches')
  if (!branchesFolder) {
    const branchesFolder = createBranchesFolder()
    rootMap.set('branches', branchesFolder)
  }

  return project
}

const createBranchesFolder = () => {
  // Branches folder is a seperate Y.Doc so rest of oriject isnt affected by goings
  // back in time
  const branchesFolder = new Y.Doc()
  const rootMap = branchesFolder.getMap<Y.Doc>()
  const mainBranch = createBranch('main')
  rootMap.set(mainBranch.guid, mainBranch)

  return branchesFolder
}

const createBranch = (name: string) => {
  // Branch is the final level of the Y.Doc tree, afte this, sub types that are
  // not Y.Docs are used to store data
  const branch = new Y.Doc()
  const rootMap = branch.getMap()
  rootMap.set('name', name)
  rootMap.set('resources', createIntialResources({ makeStarter: true }))

  return branch
}

const createIntialResources = ({
  makeStarter = false,
}: {
  makeStarter?: boolean
}) => {
  const resources = new Y.Map()

  if (makeStarter) {
    const starterCollection = createCollection('My First Collection')
    resources.set('id', starterCollection)
  }

  return resources
}

const createCollection = (name: string) => {
  const collection = new Y.Map()
  collection.set('id', uuid())
  collection.set('name', name)
  collection.set('folders', new Y.Array())
  collection.set('restRequests', new Y.Array())
  collection.set('restResponses', new Y.Array())

  return collection
}
