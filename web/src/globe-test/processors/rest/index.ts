/* eslint-disable @typescript-eslint/no-explicit-any */
import { RESTResponseBase, LoadingResult } from '@apiteam/types'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { updateFocusedRESTResponse } from 'src/components/app/collection-editor/RESTResponsePanel'
import { FocusedElementDictionary } from 'src/contexts/reactives'

import {
  BaseJob,
  ExecutingJob,
  PostExecutionJob,
  QueuedJob,
  updateFilterQueue,
} from '../../lib'

// Called when got job id form globe-test to create a new RESTResponse
export const ensureRESTResponseExists = ({
  job,
  workspace,
  focusedResponseDict,
  currentQueue,
}: {
  job: BaseJob & (ExecutingJob | PostExecutionJob)
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
  currentQueue: QueuedJob[]
}): QueuedJob[] => {
  if (job.createdEntry) return currentQueue

  const { projectId, branchId, collectionId } = job

  const restResponsesYMap = workspace
    .getMap<any>('projects')
    ?.get(projectId)
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
    ?.get('restResponses') as Y.Map<any>

  const restResponse: RESTResponseBase & LoadingResult = {
    id: uuid(),
    __typename: 'RESTResponse',
    parentId: job.underlyingRequest.id,
    __parentTypename: job.underlyingRequest.__typename,
    name: job.underlyingRequest.name,
    method: job.underlyingRequest.method,
    endpoint: job.underlyingRequest.endpoint,
    __subtype: 'LoadingResponse',
    createdAt: new Date(),
    updatedAt: null,
    options: null,
  }

  const responseYMap = new Y.Map()

  Array.from(Object.entries(restResponse)).forEach(([key, value]) => {
    if (key === 'createdAt') {
      responseYMap.set(key, (value as Date).toISOString())
    } else {
      responseYMap.set(key, value)
    }
  })

  restResponsesYMap.set(restResponse.id as string, responseYMap)

  // Update focused response
  updateFocusedRESTResponse(focusedResponseDict, responseYMap)

  // Update job with the target response id
  job.targetId = restResponse.id
  job.createdEntry = true

  return updateFilterQueue(currentQueue, [job])
}

export const addOptionsToRESTJob = ({
  job,
  options,
  workspace,
  focusedResponseDict,
  currentQueue,
}: {
  job: BaseJob & (ExecutingJob | PostExecutionJob)
  options: Record<string, any>
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
  currentQueue: QueuedJob[]
}): QueuedJob[] => {
  const { projectId, branchId, collectionId } = job

  const responseYMap = workspace
    .getMap<any>('projects')
    ?.get(projectId)
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
    ?.get('restResponses')
    .get(job.targetId) as Y.Map<any>

  if (responseYMap === undefined) {
    const newQueue = ensureRESTResponseExists({
      job,
      workspace,
      focusedResponseDict,
      currentQueue,
    })

    return addOptionsToRESTJob({
      job,
      options,
      workspace,
      focusedResponseDict,
      currentQueue: newQueue,
    })
  }

  responseYMap.set('options', options)

  return currentQueue
}

export { postProcessRESTRequest } from './post-process'
