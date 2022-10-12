/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeVar } from '@apollo/client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

type ActiveEnvironmentDictionary = {
  [WorkspaceId_ProjectId_BranchId: string]: string | null
}

export const activeEnvironmentVar = makeVar<ActiveEnvironmentDictionary>({})

export const getBranchEnvironmentKey = (branchYMap: YMap<any>) => {
  const branchId = branchYMap.get('id')

  const project = branchYMap?.parent?.parent as YMap<any>

  if (!project) {
    throw new Error('getActiveWorkspaceId: collectionYMap is not in a project')
  }

  const projectId = project.get('id')

  const workspace = project.doc

  if (!workspace) {
    throw new Error('getActiveWorkspaceId: branchYMap is not in a workspace')
  }

  const workspaceId = workspace.guid

  return `${workspaceId}_${projectId}_${branchId}`
}

export const updateActiveEnvironmentId = (
  activeEnvironmentDict: ActiveEnvironmentDictionary,
  branchYMap: YMap<any>,
  environmentId: string | null
) => {
  const newName = getBranchEnvironmentKey(branchYMap)

  activeEnvironmentVar({
    ...activeEnvironmentDict,
    [newName]: environmentId,
  } as ActiveEnvironmentDictionary)
}
