import {
  RESTRequest,
  GlobeTestMessage,
  StatusType,
  ExecutionParams,
  RESTResponse,
} from '@apiteam/types/src'
import { makeVar } from '@apollo/client'

export type BaseJob = {
  // Don't trust end client to create UUIDs so these are clientside only
  localId: string
  createdAt: Date
  // TODO: add future requests eg REST here
  underlyingRequest: RESTRequest
  agent: 'Browser' | 'GlobeTest'
  scopeId: string
  source: string
  sourceName: string
  messages: GlobeTestMessage[]
  projectId: string
  branchId: string
  collectionId: string
  environmentContext: ExecutionParams['environmentContext']
  createdEntry?: boolean
}

export type PendingLocalJob = {
  __subtype: 'PendingLocalJob'
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
  jobStatus: 'POST_PROCESSING' | 'COMPLETED_SUCCESS' | 'COMPLETED_FAILED'
  jobId: string
  jobVariant: RESTResponse['__subtype']
  targetId: string
}

export type QueuedJob = BaseJob &
  (PendingLocalJob | ExecutingJob | PostExecutionJob)

const initialQueue: QueuedJob[] = []

export const jobQueueVar = makeVar(initialQueue)

// Utility function to update job by id
export const updateFilterQueue = (
  oldQueue: QueuedJob[],
  updatedJobs: QueuedJob[]
) => {
  const idArray = updatedJobs.map((job) => job.localId)

  // Filter queues to see if job id in updatedJobs
  const nonUpdatedJobs = oldQueue.filter(
    (job) => !idArray.includes(job.localId)
  )
  return [...nonUpdatedJobs, ...updatedJobs]
}
