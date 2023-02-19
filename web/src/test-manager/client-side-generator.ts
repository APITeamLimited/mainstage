/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  determineGlobetestAgent,
  ExecutionParams,
  ExecutionScript,
  generateTestData,
  GenerateTestDataArgs,
  ExecutionOptions,
} from '@apiteam/types'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { BaseJob, jobQueueVar, PendingJob, QueuedJob } from './lib'

/** Creates a new single rest job and adds it to the queue. */
export const clientSideGenerator = async ({
  executionOptions,
  scopeId,
  jobQueue,
  nodeYMap,
  collectionYMap,
  executionScript,
  environmentContext,
  collectionContext,
  oauthLocalSaveKey,
  firstLevelData,
}: {
  executionOptions: ExecutionOptions
  scopeId: string
  jobQueue: QueuedJob[]
  nodeYMap: YMap<any>
  collectionYMap: YMap<any>
  executionScript: ExecutionScript
  environmentContext: ExecutionParams['environmentContext']
  collectionContext: ExecutionParams['collectionContext']
  oauthLocalSaveKey?: string
  firstLevelData: GenerateTestDataArgs['firstLevelData']
}): Promise<BaseJob & PendingJob> => {
  const timeNow = new Date().getTime()

  const testData = await generateTestData({
    rootScript: {
      name: executionScript.name,
      contents: executionScript.script,
    },
    nodeYMap: nodeYMap,
    collectionYMap,
    collectionContext,
    environmentContext,
    firstLevelData,
    oauthLocalSaveKey,
  })

  const branch = collectionYMap.parent?.parent as YMap<any> | undefined
  const project = branch?.parent?.parent as YMap<any> | undefined
  const collectionId = collectionYMap.get('id')
  const branchId = branch?.get('id') as string | undefined
  const projectId = project?.get('id') as string | undefined

  if (!collectionId || !branchId || !projectId) {
    throw new Error(
      `Invalid test, the target node: ${nodeYMap.get(
        'id'
      )} with typename: ${nodeYMap.get(
        '__typename'
      )} ${collectionId} ${branchId} ${projectId} must have a valid parent`
    )
  }

  const job: BaseJob & PendingJob = {
    __subtype: 'PendingJob',
    testGeneratorId: uuid(),
    agent: determineGlobetestAgent(testData, executionOptions),
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

  const endTime = new Date().getTime()

  console.log(
    'test data',
    endTime - timeNow,
    testData,
    'agent',
    determineGlobetestAgent(testData, executionOptions)
  )

  return job
}
