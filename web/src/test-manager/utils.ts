/* eslint-disable @typescript-eslint/no-explicit-any */
import { WrappedExecutionParams } from '@apiteam/types/src'
import { Socket } from 'socket.io-client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { updateFocusedRESTResponse } from 'src/contexts/focused-response'
import { FocusedElementDictionary } from 'src/contexts/reactives'
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

export const handleRESTAutoFocus = (
  focusedResponseDict: FocusedElementDictionary,
  workspace: YDoc,
  socket: Socket,
  params: WrappedExecutionParams
) => {
  socket.on(
    'rest-create-response:success',
    async ({ responseId }: { responseId: string }) => {
      const tryFindResponse = async (count = 0): Promise<YMap<any>> => {
        const restResponseYMap = workspace
          .getMap<any>('projects')
          ?.get(params.projectId)
          ?.get('branches')
          ?.get(params.branchId)
          ?.get('collections')
          ?.get(params.collectionId)
          ?.get('restResponses')
          ?.get(responseId) as YMap<any>

        if (!restResponseYMap) {
          if (count >= 10) {
            throw new Error(
              `Couldn't find response with id ${responseId} after ${count} tries`
            )
          }

          // Increasing backoff
          await new Promise((resolve) => setTimeout(resolve, (count + 1) * 100))
          return tryFindResponse(count + 1)
        }

        return restResponseYMap as YMap<any>
      }

      const restResponseYMap = await tryFindResponse()

      updateFocusedRESTResponse(focusedResponseDict, restResponseYMap)
    }
  )
}
