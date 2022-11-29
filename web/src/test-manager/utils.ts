import { GlobeTestMessage, WrappedExecutionParams } from '@apiteam/types/src'

import { determineIfLocalhost } from 'src/utils/validate-url'

import { BaseJob, PendingLocalJob } from './lib'

export const getTestManagerURL = () => {
  if (process.env.NODE_ENV === 'development') {
    const host = process.env['TEST_MANAGER_HOST']
    const port = process.env['TEST_MANAGER_PORT']

    if (!(host && port)) {
      throw new Error(
        `TEST_MANAGER_HOST and TEST_MANAGER_PORT must be set, got ${host} and ${port}`
      )
    }

    return `http://${host}:${port}`
  } else {
    // Get current domain
    const domain = window.location.hostname
    return `https://${domain}`
  }
}

export const determineGlobetestAgent = async (
  url: string
): Promise<'Cloud' | 'Local'> =>
  (await determineIfLocalhost(url)) ? 'Local' : 'Cloud'

export const determineWrappedExecutionParams = (
  job: BaseJob & PendingLocalJob,
  rawBearer: string
): WrappedExecutionParams => {
  let params: WrappedExecutionParams | null = null

  if (
    job.finalRequest &&
    job.underlyingRequest &&
    job.underlyingRequest.__typename === 'RESTRequest'
  ) {
    params = {
      bearer: rawBearer,
      scopeId: job.scopeId,
      projectId: job.projectId,
      branchId: job.branchId,
      testType: 'rest',
      collectionId: job.collectionId,
      underlyingRequest: job.underlyingRequest,
      source: job.source,
      sourceName: job.sourceName,
      environmentContext: job.environmentContext,
      collectionContext: job.collectionContext,
      finalRequest: job.finalRequest,
    }
  } else {
    throw new Error('Unknown test type')
  }

  return params
}

export const testManagerWrappedQuery = (
  params: WrappedExecutionParams,
  endpoint: string
) =>
  Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (typeof value === 'object') {
        return {
          ...acc,
          [key]: JSON.stringify(value),
        }
      } else {
        return {
          ...acc,
          [key]: value,
        }
      }
    },
    {
      endpoint,
    }
  )

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseGlobeTestMessage = (message: any): GlobeTestMessage => {
  if (
    message.messageType === 'SUMMARY_METRICS' ||
    message.messageType === 'METRICS' ||
    message.messageType === 'JOB_INFO' ||
    message.messageType === 'CONSOLE' ||
    message.messageType === 'OPTIONS' ||
    message.messageType === 'ENVIRONMENT_VARIABLES' ||
    message.messageType === 'COLLECTION_VARIABLES'
  ) {
    message.message = JSON.parse(message.message)
    message.time = new Date(message.time)

    if (message.messageType === 'CONSOLE') {
      try {
        message.message.msg = JSON.parse(message.message.msg)
      } catch (error) {
        // Do nothing
      }
    }
  }

  if (message.workerId === '' && message.orchestratorId !== '') {
    delete message.workerId
    delete message.childJobId
  }

  if (message.orchestratorId === '' && message.workerId !== '') {
    delete message.orchestratorId
  }

  if (message.workerId && message.orchestratorId) {
    delete message.orchestratorId
  }

  return message
}
