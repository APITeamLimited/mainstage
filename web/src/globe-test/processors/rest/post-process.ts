/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultMetrics, MarkType } from '@apiteam/types'
import { Response } from 'k6/http'
import * as Y from 'yjs'

import { FocusedElementDictionary } from 'src/contexts/reactives'

import { BaseJob, ExecutingJob, PostExecutionJob, QueuedJob } from '../../lib'

import { uploadMetrics, uploadResponse } from './uploading'

export const postProcessRESTRequest = async ({
  job,
  currentQueue,
  rawBearer,
  scopeId,
  workspace,
}: {
  job: BaseJob & (ExecutingJob | PostExecutionJob)
  currentQueue: QueuedJob[]
  rawBearer: string
  scopeId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
}): Promise<QueuedJob[]> => {
  const newJob = job as BaseJob & PostExecutionJob
  newJob.jobStatus = 'POST_PROCESSING'

  const newQueue = currentQueue.filter(
    (queuedJob) => queuedJob.localId !== job.localId
  )

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
    throw new Error('responseYMap is undefined')
  }

  const options = responseYMap.get('options') as Record<string, any> | null

  if (!options) {
    throw new Error('Job options not found')
  }

  // Look for a tagged message with the mark 'RESTResult'
  const markedMessages = job.messages.filter(
    (message) => message.messageType === 'MARK'
  )

  const globeTestLogsStoreReceipt = markedMessages.find(
    (message) =>
      (message.message as MarkType).mark === 'GlobeTestLogsStoreReceipt'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  )?.message?.message as string | undefined

  if (!globeTestLogsStoreReceipt) {
    throw new Error('No GlobeTestLogsStoreReceipt found')
  }

  if (options?.executionMode === 'rest_single') {
    handleSuccessSingleResult({
      job: newJob,
      responseYMap,
      rawBearer,
      scopeId,
      globeTestLogsStoreReceipt,
    })
  }

  return newQueue
}

const handleSuccessSingleResult = async ({
  job,
  rawBearer,
  scopeId,
  responseYMap,
  globeTestLogsStoreReceipt,
}: {
  job: BaseJob & PostExecutionJob
  rawBearer: string
  scopeId: string
  responseYMap: Y.Map<any>
  globeTestLogsStoreReceipt: string
}): Promise<void> => {
  const markedMessages = job.messages.filter(
    (message) => message.messageType === 'MARK'
  )

  const response = (
    markedMessages.find(
      (message) => (message.message as MarkType).mark === 'RESTResult'
    )?.message as MarkType
  )?.message as Response | undefined

  if (!response) {
    handleFailureResult({ responseYMap, globeTestLogsStoreReceipt })
    return
  }

  const responsePromise = uploadResponse(
    response,
    scopeId,
    rawBearer,
    responseYMap.get('id') as string
  )

  const metrics = job.messages
    .filter((message) => message.messageType === 'SUMMARY_METRICS')
    .at(-1)?.message as DefaultMetrics

  if (!metrics) {
    handleFailureResult({ responseYMap, globeTestLogsStoreReceipt })
    return
  }

  const metricsPromise = uploadMetrics(
    metrics,
    scopeId,
    rawBearer,
    responseYMap.get('id') as string
  )

  const [responseStored, metricsStored] = await Promise.all([
    responsePromise,
    metricsPromise,
  ])

  responseYMap.set('__subtype', 'SuccessSingleResult')
  responseYMap.set('statusCode', response.status)
  responseYMap.set('response', responseStored)
  responseYMap.set('meta', {
    responseSize: parseInt(response.headers?.['Content-Length']) || 0,
    responseDuration: response.timings.duration,
  })
  responseYMap.set('metrics', metricsStored)
  responseYMap.set('globeTestLogs', {
    __typename: 'StoredObject',
    storeReceipt: globeTestLogsStoreReceipt,
    data: null,
  })
}

const handleFailureResult = ({
  responseYMap,
  globeTestLogsStoreReceipt,
}: {
  responseYMap: Y.Map<any>
  globeTestLogsStoreReceipt: string
}) => {
  responseYMap.set('__subtype', 'FailureResult')
  responseYMap.set('globeTestLogs', {
    __typename: 'StoredObject',
    storeReceipt: globeTestLogsStoreReceipt,
    data: null,
  })
}
