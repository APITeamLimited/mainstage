import { makeVar } from '@apollo/client'
import * as Y from 'yjs'

export type FocusedElementDictionary = {
  [WorkspaceId_ProjectId_collectionId: string]: Y.Map<any>
}

export const focusedElementVar = makeVar<FocusedElementDictionary>({})

export const getFocusedElementKey = (focusYMap: Y.Map<any>) => {
  const collectionYMap =
    focusYMap.get('__typename') === 'Collection'
      ? focusYMap
      : (focusYMap.parent?.parent as Y.Map<any>)

  if (!collectionYMap) {
    throw new Error('collectionYMap not found')
  }

  const collectionId = collectionYMap.get('id')

  const branch = collectionYMap.parent?.parent as Y.Map<any>

  if (!branch) {
    throw new Error('updateFilter: collectionYMap is not in a branch')
  }

  const branchId = branch.get('id')

  const project = branch?.parent?.parent as Y.Map<any>

  if (!project) {
    throw new Error('updateFilter: collectionYMap is not in a project')
  }

  const projectId = project.get('id')

  const workspace = project.doc

  if (!workspace) {
    throw new Error('updateFilter: collectionYMap is not in a workspace')
  }

  const workspaceId = workspace.guid

  return `${workspaceId}_${projectId}_${branchId}_${collectionId}`
}

export const updateFocusedElement = (
  focusedElementDict: FocusedElementDictionary,
  focusYMap: Y.Map<any>
) => {
  const newName = getFocusedElementKey(focusYMap)

  focusedElementVar({
    ...focusedElementDict,
    [newName]: focusYMap,
  })
}
