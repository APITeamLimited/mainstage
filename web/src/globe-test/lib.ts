import { makeVar } from '@apollo/client'
import { RESTRequest, AcceptibleMessages } from 'types/src'
import { v4 as uuid } from 'uuid'

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
  messages: AcceptibleMessages[]
}

export type PendingJob = {
  jobStatus: 'pending'
}

export type StartingJob = {
  jobStatus: 'starting'
}

export type ExecutingJob = {
  jobStatus: 'executing'
  id: string
}

export type QueuedJob = BaseJob & (StartingJob | PendingJob | ExecutingJob)

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
