/* eslint-disable @typescript-eslint/no-explicit-any */
import { WrappedExecutionParams } from '@apiteam/types/src'

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
