import { makeVar } from '@apollo/client'
import { RESTRequest, GlobeTestMessage, StatusType } from 'types/src'
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
}

export type PendingLocalJob = {
  jobStatus: 'LOCAL_CREATING' | 'LOCAL_SUBMITTING'
}

export type ExecutingJob = {
  jobStatus: StatusType
  id: string
}

export type PostExecutionJob = {
  jobStatus: 'POST_PROCESSING' | 'COMPLETE'
  id: string
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
