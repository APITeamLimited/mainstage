/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionParams,
  ExecutionScript,
  RESTRequest,
} from '@apiteam/types/src'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { BaseJob, jobQueueVar, PendingLocalJob, QueuedJob } from './lib'
import { getFinalRequest } from './rest'
import { determineGlobetestAgent } from './utils'

/** Creates a new single rest job and adds it to the queue. */
export const singleRESTRequestGenerator = async ({
  request,
  scopeId,
  jobQueue,
  requestYMap,
  collectionYMap,
  executionScript,
  environmentContext,
  collectionContext,
}: {
  request: RESTRequest
  scopeId: string
  jobQueue: QueuedJob[]
  requestYMap: YMap<any>
  collectionYMap: YMap<any>
  executionScript: ExecutionScript
  environmentContext: ExecutionParams['environmentContext']
  collectionContext: ExecutionParams['collectionContext']
}): Promise<BaseJob & PendingLocalJob> => {
  const branch = collectionYMap.parent?.parent as YMap<any> | undefined
  const project = branch?.parent?.parent as YMap<any> | undefined
  const collectionId = collectionYMap.get('id')
  const branchId = branch?.get('id') as string | undefined
  const projectId = project?.get('id') as string | undefined
  const workspaceId = collectionYMap.doc?.guid as string | undefined

  if (!collectionId || !branchId || !projectId) {
    throw new Error(
      `Invalid request: ${requestYMap.get(
        'id'
      )} ${collectionId} ${branchId} ${projectId} must have a valid parent`
    )
  }

  if (!workspaceId) throw new Error('WorkspaceId not found')

  const axiosConfig = await getFinalRequest(
    request,
    requestYMap,
    collectionYMap,
    environmentContext,
    collectionContext
  )

  const job: BaseJob & PendingLocalJob = {
    __subtype: 'PendingLocalJob',
    localId: uuid(),
    agent: await determineGlobetestAgent(axiosConfig.url as string),
    createdAt: new Date(),
    jobStatus: 'LOCAL_CREATING',
    source: executionScript.script,
    sourceName: executionScript.name,
    scopeId,
    messages: [],
    projectId: projectId,
    branchId: branchId,
    collectionId: collectionId,
    environmentContext,
    collectionContext,
  }

  jobQueueVar([...jobQueue, job])

  return job
}
