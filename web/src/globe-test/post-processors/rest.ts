import { RESTResponse, TagType } from 'types/src'

import { uploadResource } from 'src/store'

import {
  BaseJob,
  ExecutingJob,
  jobQueueVar,
  PostExecutionJob,
  QueuedJob,
  updateFilterQueue,
} from '../lib'

type PostProcessRESTRequestArgs = {
  job: QueuedJob
  queueRef: React.MutableRefObject<QueuedJob[] | null>
  rawBearer: string
}

export const postProcessRESTRequest = async ({
  job,
  queueRef,
  rawBearer,
}: PostProcessRESTRequestArgs): Promise<void> => {
  const newJob = job as BaseJob & (ExecutingJob | PostExecutionJob)
  newJob.jobStatus = 'POST_PROCESSING'
  newJob as PostExecutionJob
  jobQueueVar(updateFilterQueue(queueRef.current || [], [newJob]))
  console.log('YEET', newJob)

  // Look for a tagged message with the tag 'RESTResult'

  const restResult = job.messages
    .filter((message) => message.messageType === 'TAG')
    .find((message) => (message.message as TagType).tag === 'RESTResult')

  if (!restResult) {
    throw new Error('No RESTResult tag found')
  }

  console.log(restResult)

  // Convert newJob.messages to blob
  const blobMessages = new Blob([JSON.stringify(newJob.messages)], {
    type: 'application/json',
  })

  // Upload logs to store
  const storeReceipt = await uploadResource({
    scopeId: newJob.scopeId,
    token: rawBearer,
    resource: blobMessages,
    resourceName: `${newJob.jobId}:logs.json`,
  })

  /*const restResponsee: RESTResponse = {
    __typename: 'RESTResponse',
    parentId: newJob.underlyingRequest.parentId,
    __parentTypename: newJob.underlyingRequest.__typename,
    name: `${newJob.underlyingRequest.name}-response`,
    discreteResults:
  }*/
}
