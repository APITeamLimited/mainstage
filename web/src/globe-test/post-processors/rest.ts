/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultMetrics,
  FailureDiscreteResult,
  RESTResponse,
  StoredObject,
  SuccessDiscreteResult,
  TagType,
} from '@apiteam/types'
import { Response } from 'k6/http'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { updateFocusedRESTResponse } from 'src/components/app/collection-editor/RESTResponsePanel'
import { FocusedElementDictionary } from 'src/contexts/reactives'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
}

export const postProcessRESTRequest = async ({
  job,
  queueRef,
  rawBearer,
  workspace,
  focusedResponseDict,
}: PostProcessRESTRequestArgs): Promise<void> => {
  const newJob = job as BaseJob & (ExecutingJob | PostExecutionJob)
  newJob.jobStatus = 'POST_PROCESSING'
  newJob as BaseJob & PostExecutionJob
  jobQueueVar(updateFilterQueue(queueRef.current || [], [newJob]))

  // Look for a tagged message with the tag 'RESTResult'
  const response = (
    job.messages
      .filter((message) => message.messageType === 'TAG')
      .find((message) => (message.message as TagType).tag === 'RESTResult')
      ?.message as TagType
  )?.message as Response | undefined

  if (!response) {
    throw new Error('No RESTResult tag found')
  }

  const metrics = job.messages
    .filter((message) => message.messageType === 'METRICS')
    .at(-1)?.message as DefaultMetrics

  if (!metrics) {
    throw new Error('No METRICS message found')
  }

  if (response.status === 0) {
    throw `Failed to fetch request: ${response.request.url}: ${response.error}`
  }

  const responseId = uuid()

  const restResponse: RESTResponse = {
    id: responseId,
    __typename: 'RESTResponse',
    parentId: newJob.underlyingRequest.id,
    __parentTypename: newJob.underlyingRequest.__typename,
    name: `${newJob.underlyingRequest.name}-response`,
    endpoint: newJob.underlyingRequest.endpoint,
    ...(response.error_code === 0
      ? await getSuccessResult({
          metrics,
          response,
          responseId,
          rawBearer,
          scopeId: newJob.scopeId,
          jobId: newJob.jobId,
        })
      : await getFailureResult({
          metrics,
          response,
          responseId,
          rawBearer,
          scopeId: newJob.scopeId,
          jobId: newJob.jobId,
        })),
    createdAt: new Date(),
    updatedAt: null,
    method: newJob.underlyingRequest.method,
  }

  storeInEntityEngine(restResponse, workspace, job, focusedResponseDict)
}

type DiscreteArgs = {
  metrics: DefaultMetrics
  response: Response
  responseId: string
  rawBearer: string
  scopeId: string
  jobId: string
}

const getSuccessResult = async ({
  metrics,
  response,
  responseId,
  rawBearer,
  scopeId,
  jobId,
}: DiscreteArgs): Promise<SuccessDiscreteResult> => {
  const responsePromise = uploadResponse(
    response,
    scopeId,
    rawBearer,
    responseId
  )
  const metricsPromise = uploadMetrics(metrics, scopeId, rawBearer, responseId)

  const [responseStored, metricsStored] = await Promise.all([
    responsePromise,
    metricsPromise,
  ])

  return {
    type: 'Success',
    statusCode: response.status,
    response: responseStored,
    meta: {
      responseSize: parseInt(response.headers?.['Content-Length']) || 0,
      responseDuration: response.timings.duration,
    },
    metrics: metricsStored,
    globeTestLogs: {
      __typename: 'StoredObject',
      storeReceipt: `GlobeTest:${jobId}:messages.json`,
      data: null,
    },
  }
}

const getFailureResult = async ({
  metrics,
  response,
  responseId,
  rawBearer,
  scopeId,
  jobId,
}: DiscreteArgs): Promise<FailureDiscreteResult> => {
  const responsePromise = uploadResponse(
    response,
    scopeId,
    rawBearer,
    responseId
  )
  const metricsPromise = uploadMetrics(metrics, scopeId, rawBearer, responseId)

  const [responseStored, metricsStored] = await Promise.all([
    responsePromise,
    metricsPromise,
  ])

  return {
    type: 'Fail',
    statusCode: response.status,
    response: responseStored,
    meta: {
      responseSize: parseInt(response.headers?.['Content-Length']) || 0,
      responseDuration: response.timings.duration,
    },
    metrics: metricsStored,
    globeTestLogs: {
      __typename: 'StoredObject',
      storeReceipt: `GlobeTest:${jobId}:messages.json`,
      data: null,
    },
  }
}

const uploadResponse = async (
  response: Response,
  scopeId: string,
  rawBearer: string,
  responseId: string
): Promise<StoredObject<Response>> => {
  const blob = new Blob([JSON.stringify(response)], {
    type: 'application/json',
  })

  const storeReceipt = await uploadResource({
    scopeId,
    rawBearer,
    resource: blob,
    resourceName: `RESTResponse:${responseId}:response.json`,
  })

  return {
    __typename: 'StoredObject',
    storeReceipt,
    data: null,
  }
}

const uploadMetrics = async (
  metrics: DefaultMetrics,
  scopeId: string,
  rawBearer: string,
  responseId: string
): Promise<StoredObject<DefaultMetrics>> => {
  const blob = new Blob([JSON.stringify(metrics)], {
    type: 'application/json',
  })

  const storeReceipt = await uploadResource({
    scopeId,
    rawBearer,
    resource: blob,
    resourceName: `RESTResponse:${responseId}:metrics.json`,
  })

  return {
    __typename: 'StoredObject',
    storeReceipt,
    data: null,
  }
}

const storeInEntityEngine = (
  formattedResponse: RESTResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspace: Y.Doc,
  job: QueuedJob,
  focusedResponseDict: FocusedElementDictionary
) => {
  const { projectId, branchId, collectionId } = job

  const restResponsesYMap = workspace
    .getMap<any>('projects')
    ?.get(projectId)
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
    ?.get('restResponses') as Y.Map<any>

  if (!restResponsesYMap) {
    throw new Error('No restResponses YMap found')
  }

  const responseYMap = new Y.Map()

  responseYMap.set('id', formattedResponse.id)
  responseYMap.set('__typename', 'RESTResponse')
  responseYMap.set('parentId', formattedResponse.parentId)
  responseYMap.set('__parentTypename', formattedResponse.__parentTypename)
  responseYMap.set('name', formattedResponse.name)
  responseYMap.set('endpoint', formattedResponse.endpoint)
  responseYMap.set('createdAt', formattedResponse.createdAt.toISOString())
  responseYMap.set(
    'updatedAt',
    formattedResponse.updatedAt
      ? formattedResponse.updatedAt.toISOString()
      : null
  )
  responseYMap.set('method', formattedResponse.method)

  responseYMap.set('type', formattedResponse.type)
  if (
    formattedResponse.type === 'Success' ||
    formattedResponse.type === 'Fail'
  ) {
    responseYMap.set('statusCode', formattedResponse.statusCode)
    responseYMap.set('meta', formattedResponse.meta)
    responseYMap.set('globeTestLogs', formattedResponse.globeTestLogs)
    responseYMap.set('response', formattedResponse.response)
    responseYMap.set('metrics', formattedResponse.metrics)
  }

  restResponsesYMap.set(formattedResponse.id, responseYMap)

  // Update focused response
  updateFocusedRESTResponse(focusedResponseDict, responseYMap)
}
