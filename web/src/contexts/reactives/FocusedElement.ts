/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeVar } from '@apollo/client'
import type { Map as YMap } from 'yjs'

export type FocusedElementDictionary = {
  [WorkspaceId_ProjectId_BranchId: string]: YMap<any>
}

export const focusedElementVar = makeVar<FocusedElementDictionary>({})

export const updateFocusedElement = (
  focusedElementDict: FocusedElementDictionary,
  focusYMap: YMap<any>
) => {
  const newName = getFocusedElementKey(focusYMap)

  focusedElementVar({
    ...focusedElementDict,
    [newName]: focusYMap,
  })
}

export const clearFocusedElement = (
  focusedElementDict: FocusedElementDictionary,
  originalFocusYMap: YMap<any>
) => {
  const newName = getFocusedElementKey(originalFocusYMap)

  const newFocusedElementDict = { ...focusedElementDict }
  delete newFocusedElementDict[newName]

  focusedElementVar(newFocusedElementDict)
}

export const getFocusedElementKey = (focusYMap: YMap<any>) => {
  const typename = focusYMap.get('__typename') as string | undefined

  let branch: YMap<any> | undefined

  if (typename === 'Collection' || typename === 'Environment') {
    branch = focusYMap.parent?.parent as YMap<any> | undefined
  } else {
    branch = (focusYMap?.parent?.parent?.parent?.parent ?? undefined) as
      | YMap<any>
      | undefined
  }
  if (!branch) {
    throw new Error(
      `updateFilter: focusYMap is not in a branch got typename ${typename}`
    )
  }

  const branchId = branch.get('id')

  const project = branch?.parent?.parent as YMap<any>

  if (!project) {
    throw new Error('updateFilter: focusYMap is not in a project')
  }

  const projectId = project.get('id')

  const workspace = project.doc

  if (!workspace) {
    throw new Error('updateFilter: focusYMap is not in a workspace')
  }

  const workspaceId = workspace.guid

  return `${workspaceId}_${projectId}_${branchId}`
}
