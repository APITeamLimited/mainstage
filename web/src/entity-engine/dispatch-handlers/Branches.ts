/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeVar } from '@apollo/client'
import { v4 as uuid } from 'uuid'

import { BaseEntity } from 'src/contexts/reactives'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { createIntialResources } from '../../../../entity-engine/src/entities'

export interface Branch extends BaseEntity {
  id: string
  __typename: 'Branch'
  name: string
  createdAt: Date
  updatedAt: Date | null
}

export const branchesVar = makeVar<Branch[]>([])

export const processBranches = (newBranchesMap: Y.Map<any>) => {
  const generatedBranches: Branch[] = []

  newBranchesMap.forEach((branch: Y.Map<any>, branchId: string) => {
    generatedBranches.push({
      id: branchId,
      __typename: 'Branch',
      name: branch.get('name'),
      createdAt: new Date(branch.get('createdAt')),
      updatedAt: branch.get('updatedAt')
        ? new Date(branch.get('updatedAt'))
        : null,
    })
  })

  branchesMap = newBranchesMap
  branchesVar(generatedBranches)
}

let branchesMap: Y.Map<any> | null = null

export const updateBranch = (branch: Branch) => {
  if (branchesMap) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const yjsBranch = branchesMap.get(branch.id)
    if (yjsBranch) {
      let updated = false
      // Check to see what values have changed
      const nameChanged = yjsBranch.get('name') !== branch.name

      if (nameChanged) {
        yjsBranch.set('name', branch.name)
        updated = true
      }

      if (updated) {
        yjsBranch.set('updatedAt', new Date().toISOString())
      }
    }
  }
  throw 'No branches map'
}

export const deleteBranch = (id: string) => {
  if (branchesMap) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const yjsBranch = branchesMap.get(id)
    if (yjsBranch) {
      branchesMap.delete(id)
    }
  }
  throw 'No branches map'
}

export const createBranch = (name: string) => {
  if (branchesMap) {
    const id = uuid()
    const newBranch = new Y.Map()
    newBranch.set('id', id)
    newBranch.set('name', name)
    newBranch.set('createdAt', new Date().toISOString())
    newBranch.set('updatedAt', null)
    newBranch.set('resources', createIntialResources(true))
    branchesMap.set(id, newBranch)
  }
  throw 'No branches map'
}
