import { RESTAuth, RESTRequest } from '@apiteam/types'
import { AxiosRequestConfig } from 'axios'
import { stringify } from 'qs'
import * as Y from 'yjs'

import { findEnvironmentVariables } from 'src/utils/findVariables'

/*
Gets final axios config for a request, complete with environment variables
*/
export const getFinalRequest = (
  request: RESTRequest,
  requestYMap: Y.Map<any>,
  activeEnvironment: Y.Map<any> | null,
  collection: Y.Map<any>
): AxiosRequestConfig => {
  let body = null

  if (request.body.contentType === null) {
    body = null
  } else if (request.body.contentType === 'application/x-www-form-urlencoded') {
    body = stringify(
      request.body.body
        .filter(({ enabled }) => enabled)
        .map(({ keyString, value }) => ({ [keyString]: value }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    )
  } else if (request.body.contentType === 'multipart/form-data') {
    throw 'multipart/form-data not implemented'
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
  if (!finalHeaders['content-type'] && request.body.contentType) {
    finalHeaders['content-type'] = request.body.contentType
  }

  const folders = collection.get('folders') as Y.Map<any>

  const withAuthRequest = addAuthToRequest(
    activeEnvironment,
    collection,
    requestYMap,
    folders,
    {
      method: request.method,
      url: request.endpoint,
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

  return makeEnvironmentAwareRequest(
    activeEnvironment,
    collection,
    withAuthRequest
  )
}

const addAuthToRequest = (
  activeEnvironment: Y.Map<any> | null,
  collection: Y.Map<any>,
  currentNode: Y.Map<any>,
  folders: Y.Map<any>,
  axiosConfig: AxiosRequestConfig
): AxiosRequestConfig => {
  const auth = currentNode.get('auth') as RESTAuth

  if (auth.authType === 'inherit') {
    if (currentNode.get('__typename') === 'Collection') {
      throw 'Inherit auth type not allowed on collection'
    }

    const parentFolder = (Array.from(folders.values()) as Y.Map<any>[]).find(
      (folder) => folder.get('id') === currentNode.get('parentId')
    )

    if (parentFolder) {
      return addAuthToRequest(
        activeEnvironment,
        collection,
        parentFolder,
        folders,
        axiosConfig
      )
    }

    if (collection.get('id') === currentNode.get('parentId')) {
      return addAuthToRequest(
        activeEnvironment,
        collection,
        collection,
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
          activeEnvironment,
          collection,
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
          [findEnvironmentVariables(activeEnvironment, collection, auth.key)]:
            findEnvironmentVariables(activeEnvironment, collection, auth.value),
        },
      }
    } else if (auth.addTo === 'query') {
      return {
        ...axiosConfig,
        params: {
          ...axiosConfig.params,
          [findEnvironmentVariables(activeEnvironment, collection, auth.key)]:
            findEnvironmentVariables(activeEnvironment, collection, auth.value),
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
  activeEnvironment: Y.Map<any> | null,
  collection: Y.Map<any>,
  config: AxiosRequestConfig
): AxiosRequestConfig => {
  return {
    ...config,
    url: findEnvironmentVariables(
      activeEnvironment,
      collection,
      config.url || ''
    ),

    // Search for environment variables in header keys and values
    headers: Object.entries(config.headers || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(activeEnvironment, collection, key)]:
          findEnvironmentVariables(
            activeEnvironment,
            collection,
            String(value)
          ),
      }),
      {}
    ),

    // Search for environment variables in params keys and values
    params: Object.entries(config.params || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(activeEnvironment, collection, key)]:
          findEnvironmentVariables(
            activeEnvironment,
            collection,
            String(value)
          ),
      }),
      {}
    ),

    data: config.data
      ? findEnvironmentVariables(activeEnvironment, collection, config.data)
      : null,
  }
}
