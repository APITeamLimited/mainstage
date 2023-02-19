/* eslint-disable @typescript-eslint/no-explicit-any */
import { WrappedExecutionParams } from '@apiteam/types'

import { BaseJob, PendingJob } from './lib'

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

export const determineWrappedExecutionParams = (
  job: BaseJob & PendingJob,
  rawBearer: string
): WrappedExecutionParams => {
  const params: WrappedExecutionParams = {
    bearer: rawBearer,
    scopeId: job.scopeId,
    projectId: job.projectId,
    branchId: job.branchId,
    collectionId: job.collectionId,
    environmentContext: job.environmentContext,
    collectionContext: job.collectionContext,
    testData: job.testData,
  }

  return params
}
