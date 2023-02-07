import {
  StatusType,
  ExecutionParams,
  RESTResponse,
  TestData,
} from '@apiteam/types/src'
import { makeVar } from '@apollo/client'

export type BaseJob = {
  // Don't trust end client to create UUIDs so these are clientside only
  testGeneratorId: string
  createdAt: Date
  agent: 'Cloud' | 'Local'
  scopeId: string
  sourceName: string
  projectId: string
  branchId: string
  collectionId: string
  collectionContext: ExecutionParams['collectionContext']
  environmentContext: ExecutionParams['environmentContext']
  testData: TestData
}

export type PendingJob = {
  __subtype: 'PendingJob'
  jobStatus: 'LOCAL_CREATING' | 'LOCAL_SUBMITTING'
}

export type ExecutingJob = {
  __subtype: 'ExecutingJob'
  jobStatus: StatusType
  jobId: string
  jobVariant: RESTResponse['__subtype']
  targetId: string
}

export type PostExecutionJob = {
  __subtype: 'PostExecutionJob'
  jobStatus: 'POST_PROCESSING' | 'COMPLETED_SUCCESS' | 'COMPLETED_FAILURE'
  jobId: string
  jobVariant: RESTResponse['__subtype']
  targetId: string
}

export type QueuedJob = BaseJob & (PendingJob | ExecutingJob | PostExecutionJob)

const initialQueue: QueuedJob[] = []

export const jobQueueVar = makeVar(initialQueue)

// Utility function to update job by id
export const updateFilterQueue = (
  oldQueue: QueuedJob[],
  updatedJobs: QueuedJob[]
) => {
  const idArray = updatedJobs.map((job) => job.testGeneratorId)

  // Filter queues to see if job id in updatedJobs
  const nonUpdatedJobs = oldQueue.filter(
    (job) => !idArray.includes(job.testGeneratorId)
  )
  return [...nonUpdatedJobs, ...updatedJobs]
}
