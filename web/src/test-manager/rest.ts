/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionParams, RESTAuth, RESTRequest } from '@apiteam/types/src'
import { AxiosRequestConfig } from 'axios'
import { stringify } from 'qs'
import type { Map as YMap } from 'yjs'

import { findEnvironmentVariables } from 'src/utils/environment'
import { validateURL } from 'src/utils/validate-url'

/*
Gets final axios config for a request, complete with environment variables
*/
export const getFinalRequest = async (
  request: RESTRequest,
  requestYMap: YMap<any>,
  collectionYMap: YMap<any>,
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext']
): Promise<AxiosRequestConfig<any>> => {
  //const lookup = await import('mime-types').then((m) => m.lookup)

  const workspaceId = collectionYMap.doc?.guid as string | undefined
  if (!workspaceId) throw new Error('WorkspaceId not found')

  let body = null
  const skipBodyEnvironmentSubstitution = false

  if (request.body.contentType === 'none') {
    body = null
  } else if (request.body.contentType === 'application/x-www-form-urlencoded') {
    body = stringify(
      request.body.body
        .filter(({ enabled }) => enabled)
        .map(({ keyString, value }) => ({
          [findEnvironmentVariables(
            environmentContext,
            collectionContext,
            keyString
          )]: findEnvironmentVariables(
            environmentContext,
            collectionContext,
            value
          ),
        }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    )
  } else if (request.body.contentType === 'multipart/form-data') {
    // TODO: implement this in globetest worker
    // Skip for now
  } /*else if (request.body.contentType === 'application/octet-stream') {
    skipBodyEnvironmentSubstitution = true

    // TODO: implement this in globetest worker
    // Skip for now

    // If no body data, refetch
  } */ else {
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

  const withAuthRequest = addAuthToRequest(
    environmentContext,
    collectionContext,
    collectionYMap,
    requestYMap,
    folders,
    {
      method: request.method,
      url: await ensureValidUrl(
        findEnvironmentVariables(
          environmentContext,
          collectionContext,
          substitutePathVariables(request.endpoint, request)
        )
      ),
      headers: finalHeaders,
      params: request.params
        .filter(
          (param) =>
            param.enabled && param.keyString !== '' && param.value !== ''
        )
        .map((param) => ({
          [param.keyString]: param.value,
        }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      data: body,
    }
  )

  // Sometimes empty headers are set, this removes them
  withAuthRequest.headers = Object.entries(
    withAuthRequest.headers || {}
  ).reduce((acc, [key, value]) => {
    if (!key || !value) return acc
    if (key === '' || value === '') return acc

    return {
      ...acc,
      [findEnvironmentVariables(environmentContext, collectionContext, key)]:
        findEnvironmentVariables(
          environmentContext,
          collectionContext,
          String(value)
        ),
    }
  }, {})

  return makeEnvironmentAwareRequest(
    environmentContext,
    collectionContext,
    withAuthRequest,
    skipBodyEnvironmentSubstitution
  )
}

const addAuthToRequest = (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  collectionYMap: YMap<any>,
  currentNode: YMap<any>,
  folders: YMap<any>,
  axiosConfig: AxiosRequestConfig
): AxiosRequestConfig => {
  const auth = currentNode.get('auth') as RESTAuth

  if (auth.authType === 'inherit') {
    if (currentNode.get('__typename') === 'Collection') {
      throw 'Inherit auth type not allowed on collectionYMap'
    }

    const parentFolder = (Array.from(folders.values()) as YMap<any>[]).find(
      (folder) => folder.get('id') === currentNode.get('parentId')
    )

    if (parentFolder) {
      return addAuthToRequest(
        environmentContext,
        collectionContext,
        collectionYMap,
        parentFolder,
        folders,
        axiosConfig
      )
    }

    if (collectionYMap.get('id') === currentNode.get('parentId')) {
      return addAuthToRequest(
        environmentContext,
        collectionContext,
        collectionYMap,
        collectionYMap,
        folders,
        axiosConfig
      )
    }

    throw 'Could not find parent of RESTRequest'
  } else if (auth.authType === 'none') {
    return axiosConfig
  } else if (auth.authType === 'basic') {
    return {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Basic ${btoa(`${auth.username}:${auth.password}`)}`,
      },
    }
  } else if (auth.authType === 'bearer') {
    return {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Bearer ${findEnvironmentVariables(
          environmentContext,
          collectionContext,
          auth.token
        )}`,
      },
    }
  } else if (auth.authType === 'api-key') {
    if (auth.addTo === 'header') {
      return {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          [findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.key
          )]: findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.value
          ),
        },
      }
    } else if (auth.addTo === 'query') {
      return {
        ...axiosConfig,
        params: {
          ...axiosConfig.params,
          [findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.key
          )]: findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.value
          ),
        },
      }
    } else {
      throw `auth.addTo === "${auth.addTo}" invalid`
    }
  } else if (auth.authType === 'oauth-2') {
    throw 'oauth-2 auth not implemented'
  }

  throw 'auth.authType invalid'
}

const makeEnvironmentAwareRequest = (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  config: AxiosRequestConfig,
  skipBody: boolean
): AxiosRequestConfig => {
  return {
    ...config,

    // Already checked the url

    // Search for environment variables in header keys and values
    headers: Object.entries(config.headers || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(environmentContext, collectionContext, key)]:
          findEnvironmentVariables(
            environmentContext,
            collectionContext,
            String(value)
          ),
      }),
      {}
    ),

    // Search for environment variables in params keys and values
    params: Object.entries(config.params || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(environmentContext, collectionContext, key)]:
          findEnvironmentVariables(
            environmentContext,
            collectionContext,
            String(value)
          ),
      }),
      {}
    ),

    data:
      config.data && !skipBody
        ? findEnvironmentVariables(
            environmentContext,
            collectionContext,
            config.data
          )
        : null,
  }
}

const substitutePathVariables = (
  endpoint: string,
  request: RESTRequest
): string => {
  return endpoint.replace(
    /:([a-zA-Z0-9-_]+)/g,
    (_, p1) =>
      (request.pathVariables ?? []).find(
        (pathVariable) => pathVariable.keyString === p1
      )?.value || ''
  )
}

const ensureValidUrl = async (url: string): Promise<string> => {
  const validUrl = await validateURL(url)

  if (validUrl === null) {
    throw new Error(`Invalid url: ${url}`)
  }

  return validUrl
}
