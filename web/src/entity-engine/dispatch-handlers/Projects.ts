/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocalProject, localProjectsVar } from 'src/contexts/reactives'

import { v4 as uuid } from 'uuid'

import { createBranch, processBranches } from './Branches'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

export const processProjects = (newProjectsMap: Y.Map<any>) => {
  const generatedProjects: LocalProject[] = []

  newProjectsMap.forEach((project, id) => {
    console.log('project', project)
    generatedProjects.push({
      id,
      __typename: 'LocalProject',
      name: project.get('name'),
      createdAt: new Date(project.get('createdAt')),
      updatedAt: project.get('updatedAt')
        ? new Date(project.get('updatedAt'))
        : null,
    })

    processBranches(project.get('branches'), id)
  })

  projectsMap = newProjectsMap
  localProjectsVar(generatedProjects)
}

let projectsMap: Y.Map<any> | null = null

export const updateProject = (project: LocalProject) => {
  if (projectsMap) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const yjsProject = projectsMap.get(project.id)
    if (yjsProject) {
      let updated = false
      // Check to see what values have changed
      const nameChanged = yjsProject.get('name') !== project.name

      if (nameChanged) {
        yjsProject.set('name', project.name)
        updated = true
      }

      if (updated) {
        yjsProject.set('updatedAt', new Date().toISOString())
      }
    }
  }
  throw 'No projects map'
}

export const deleteProject = (id: string) => {
  if (projectsMap) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const yjsProject = projectsMap.get(id)
    if (yjsProject) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      projectsMap.delete(id)
    }
  }
  throw 'No projects map'
}

export const createProject = (name: string) => {
  if (projectsMap) {
    const id = uuid()
    const newProject = new Y.Map()
    newProject.set('id', id)
    newProject.set('name', name)
    newProject.set('createdAt', new Date().toISOString())
    newProject.set('updatedAt', null)

    // Always need the main branch
    const branches = new Y.Map()
    const { branch, branchId } = createBranch('main')
    branches.set(branchId, branch)
    newProject.set('branches', branches)

    projectsMap.set(id, newProject)
  }
  throw 'No projects map'
}
