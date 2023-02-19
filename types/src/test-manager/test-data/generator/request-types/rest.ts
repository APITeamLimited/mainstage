/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'
import { stringify } from 'qs'
import type { Map as YMap } from 'yjs'

import type { RESTRequest, ExecutionOptions } from '../../../../entities'
import type { ExecutionParams } from '../../../../execution-params'
import type { GlobeTestRequest } from '../../../globe-test'
import { addAuthToAxiosConfig } from '../auth'
import { substitutePathVariables, validateURLStrict } from '../urls'
import {
  makeEnvironmentAwareRequest,
  findEnvironmentVariables,
} from '../variables'

/*
Gets final axios config for a request, complete with environment variables
*/
export const restAxiosRequest = async (
  request: RESTRequest,
  requestYMap: YMap<any>,
  collectionYMap: YMap<any>,
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext']
): Promise<AxiosRequestConfig<any>> => {
  //const lookup = await import('mime-types').then((m) => m.lookup)

  let body = null
  const skipBodyEnvironmentSubstitution = false

  if (request.body.contentType === 'none') {
    body = null
  } else if (
    request.body.contentType === 'application/x-www-form-urlencoded' ||
    request.body.contentType === 'multipart/form-data'
  ) {
    const enabledParts = request.body.body.filter(({ enabled }) => enabled)

    const enabledKeyValues = await Promise.all(
      enabledParts.map(async ({ keyString, value }) => ({
        [await findEnvironmentVariables(
          environmentContext,
          collectionContext,
          keyString
        )]: await findEnvironmentVariables(
          environmentContext,
          collectionContext,
          value
        ),
      }))
    )

    body = stringify(
      enabledKeyValues.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    )
  } else {
    body = request.body.body
  }

  const finalHeaders = request.headers
    .filter((header) => header.enabled)
    .map((header) => ({
      [header.keyString]: header.value,
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})

  // if finalHeaders doesn't have a content-type, add one
  if (!finalHeaders['content-type'] && request.body.contentType !== 'none') {
    // A more accurate content type would be to use the mime type of the file
    /*if (request.body.contentType === 'application/octet-stream') {
      const mimeType = lookup(
        request.body.body?.filename?.split('.')?.pop() ?? ''
      )

      if (mimeType) {
        finalHeaders['content-type'] = mimeType
      } else {
        finalHeaders['content-type'] = request.body.contentType
      }
    } else {
      finalHeaders['content-type'] = request.body.contentType
    }*/

    finalHeaders['content-type'] = request.body.contentType
  }

  const folders = collectionYMap.get('folders') as YMap<any>

  const uauthedConfig: AxiosRequestConfig = {
    method: request.method,
    url: substitutePathVariables(request.endpoint, request.pathVariables ?? []),
    headers: finalHeaders,
    params: request.params
      .filter(
        (param) => param.enabled && param.keyString !== '' && param.value !== ''
      )
      .map((param) => ({
        [param.keyString]: param.value,
      }))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    data: body,
  }

  const authedConfig = await addAuthToAxiosConfig(
    environmentContext,
    collectionContext,
    collectionYMap,
    requestYMap,
    folders,
    uauthedConfig
  )

  // Empty headers that could have been set by the user need to be removed
  authedConfig.headers = Object.entries(authedConfig.headers ?? {}).reduce(
    (acc, [key, value]) => {
      if (!key || !value) return acc

      return {
        ...acc,
        [key]: value,
      }
    },
    {}
  )

  const environmentAwareConfig = await makeEnvironmentAwareRequest(
    environmentContext,
    collectionContext,
    authedConfig,
    skipBodyEnvironmentSubstitution
  )

  validateURLStrict(environmentAwareConfig.url)

  return environmentAwareConfig
}

export const restFinalRequest = async (
  request: RESTRequest,
  requestYMap: YMap<any>,
  collectionYMap: YMap<any>,
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  executionOptions: ExecutionOptions
): Promise<GlobeTestRequest> => {
  const axiosConfig = await restAxiosRequest(
    request,
    requestYMap,
    collectionYMap,
    environmentContext,
    collectionContext
  )

  const uri = new URL(axiosConfig.url ?? '')
  uri.search = new URLSearchParams(axiosConfig.params).toString()

  return {
    method: axiosConfig.method ?? 'GET',
    url: uri.toString(),
    body: axiosConfig.data,
    params: {
      headers: Object.entries(axiosConfig.headers ?? {}).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value.toString(),
        }),
        {}
      ) as unknown as Record<string, string>,
      redirects: executionOptions.maxRedirects,
      timeout: executionOptions.timeoutMilliseconds,
      compression:
        executionOptions.compression !== 'none'
          ? executionOptions.compression
          : undefined,
    },
  }
}
