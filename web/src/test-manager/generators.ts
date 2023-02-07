/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  determineGlobetestAgent,
  ExecutionParams,
  ExecutionScript,
  generateTestData,
  GenerateTestDataArgs,
  RESTRequest,
} from '@apiteam/types/src'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { BaseJob, jobQueueVar, PendingJob, QueuedJob } from './lib'

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
  oauthLocalSaveKey,
  firstLevelData,
}: {
  request: RESTRequest
  scopeId: string
  jobQueue: QueuedJob[]
  requestYMap: YMap<any>
  collectionYMap: YMap<any>
  executionScript: ExecutionScript
  environmentContext: ExecutionParams['environmentContext']
  collectionContext: ExecutionParams['collectionContext']
  oauthLocalSaveKey?: string
  firstLevelData: GenerateTestDataArgs['firstLevelData']
}): Promise<BaseJob & PendingJob> => {
  const branch = collectionYMap.parent?.parent as YMap<any> | undefined
  const project = branch?.parent?.parent as YMap<any> | undefined
  const collectionId = collectionYMap.get('id')
  const branchId = branch?.get('id') as string | undefined
  const projectId = project?.get('id') as string | undefined

  if (!collectionId || !branchId || !projectId) {
    throw new Error(
      `Invalid request: ${requestYMap.get(
        'id'
      )} ${collectionId} ${branchId} ${projectId} must have a valid parent`
    )
  }

  const timeNow = new Date().getTime()

  const testData = generateTestData({
    rootScript: {
      name: executionScript.name,
      contents: executionScript.script,
    },
    nodeYMap: requestYMap,
    collectionYMap,
    collectionContext,
    environmentContext,
    firstLevelData,
    oauthLocalSaveKey,
  })

  const endTime = new Date().getTime()

  console.log(
    'test data',
    endTime - timeNow,
    testData,
    'agent',
    determineGlobetestAgent(testData, request.executionOptions)
  )

  const job: BaseJob & PendingJob = {
    __subtype: 'PendingJob',
    testGeneratorId: uuid(),
    agent: determineGlobetestAgent(testData, request.executionOptions),
    createdAt: new Date(),
    jobStatus: 'LOCAL_CREATING',
    sourceName: executionScript.name,
    scopeId,
    projectId: projectId,
    branchId: branchId,
    collectionId: collectionId,
    environmentContext,
    collectionContext,
    testData,
  }

  jobQueueVar([...jobQueue, job])

  return job
}
