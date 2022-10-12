/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionScript, RESTRequest } from '@apiteam/types/src'
import * as queryString from 'query-string'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { createEnvironmentContext } from 'src/utils/environment'

import { BaseJob, jobQueueVar, PendingLocalJob, QueuedJob } from '../lib'
import { getFinalRequest } from '../rest'

/*
Creates a new single rest job and adds it to the queue.
*/
export const singleRESTRequestGenerator = async ({
  request,
  scopeId,
  activeEnvironmentYMap,
  jobQueue,
  requestYMap,
  collectionYMap,
  executionScript,
}: {
  request: RESTRequest
  scopeId: string
  activeEnvironmentYMap: YMap<any> | null
  jobQueue: QueuedJob[]
  requestYMap: YMap<any>
  collectionYMap: YMap<any>
  executionScript: ExecutionScript
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

  const environmentContext = activeEnvironmentYMap
    ? createEnvironmentContext(activeEnvironmentYMap, workspaceId)
    : null

  const collectionContext = collectionYMap
    ? createEnvironmentContext(collectionYMap, workspaceId)
    : null

  const axiosConfig = await getFinalRequest(
    request,
    requestYMap,
    collectionYMap,
    environmentContext,
    collectionContext
  )

  const queryEncoded = `?${queryString.stringify(axiosConfig.params)}`

  const job: BaseJob & PendingLocalJob = {
    localId: uuid(),
    agent: 'GlobeTest',
    underlyingRequest: request,
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
    restRequest: {
      method: axiosConfig.method as string,
      url: `${axiosConfig.url}${
        queryEncoded.length > 1 ? queryEncoded : ''
      }` as string,
      body: axiosConfig.data,
      params: {
        headers: Object.entries(axiosConfig.headers ?? {}).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value.toString(),
          }),
          {}
        ),
      },
    },
    __subtype: 'PendingLocalJob',
  }

  jobQueueVar([...jobQueue, job])

  return job
}
