import { KeyValueItem, RESTAuth, RESTRequest } from '@apiteam/types/src'
import { AxiosRequestConfig } from 'axios'
import { stringify } from 'qs'
import * as Y from 'yjs'

import { retrieveScopedResource } from 'src/store'
import { findEnvironmentVariables } from 'src/utils/findVariables'

/*
Gets final axios config for a request, complete with environment variables
*/
export const getFinalRequest = async (
  request: RESTRequest,
  requestYMap: Y.Map<any>,
  activeEnvironment: Y.Map<any> | null,
  collection: Y.Map<any>,
  scopeId: string,
  rawBearer: string
): Promise<AxiosRequestConfig<any>> => {
  let body = null
  let skipBodyEnvironmentSubstitution = false

  if (request.body.contentType === 'none') {
    body = null
  } else if (request.body.contentType === 'application/x-www-form-urlencoded') {
    body = stringify(
      request.body.body
        .filter(({ enabled }) => enabled)
        .map(({ keyString, value }) => ({
          [findEnvironmentVariables(activeEnvironment, collection, keyString)]:
            findEnvironmentVariables(activeEnvironment, collection, value),
        }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    )
  } else if (request.body.contentType === 'multipart/form-data') {
    // Ensure all data is got
    const foundData = await Promise.all(
      request.body.body.map(async (kvItem): Promise<KeyValueItem> => {
        if (kvItem.isFile && kvItem.fileField?.data.data === null) {
          const { data } = await retrieveScopedResource({
            scopeId,
            rawBearer,
            storeReceipt: kvItem.fileField?.data.storeReceipt,
          })

          return {
            ...kvItem,
            fileField: {
              ...kvItem.fileField,
              data: {
                ...kvItem.fileField?.data,
                data,
              },
            },
          }
        } else {
          return kvItem
        }
      })
    )
    console.log('foundData', foundData)
    const bodyForm = new FormData()

    foundData.forEach(({ keyString, value, isFile, fileField }) => {
      if (isFile) {
        if (!fileField?.data.data) throw new Error('File data not found')

        bodyForm.append(
          findEnvironmentVariables(activeEnvironment, collection, keyString),
          new Blob([fileField?.data.data]),
          fileField?.filename
        )
      } else {
        bodyForm.append(
          findEnvironmentVariables(activeEnvironment, collection, keyString),
          findEnvironmentVariables(activeEnvironment, collection, value)
        )
      }
    })

    console.log('bodyForm', bodyForm)

    body = bodyForm
    skipBodyEnvironmentSubstitution = true
  } else if (request.body.contentType === 'application/octet-stream') {
    skipBodyEnvironmentSubstitution = true

    // If no body data, refetch
    if (request.body.body?.data) {
      if (!request.body.body?.data.data) {
        const { data } = await retrieveScopedResource({
          scopeId,
          rawBearer,
          storeReceipt: request.body.body.data.storeReceipt,
        })
        body = data
      } else {
        body = request.body.body.data.data
      }
    } else {
      body = null
    }
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
      url: substitutePathVariables(request.endpoint, request),
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
      [findEnvironmentVariables(activeEnvironment, collection, key)]:
        findEnvironmentVariables(activeEnvironment, collection, String(value)),
    }
  }, {})

  return makeEnvironmentAwareRequest(
    activeEnvironment,
    collection,
    withAuthRequest,
    skipBodyEnvironmentSubstitution
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
  config: AxiosRequestConfig,
  skipBody: boolean
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

    data:
      config.data && !skipBody
        ? findEnvironmentVariables(activeEnvironment, collection, config.data)
        : null,
  }
}

const substitutePathVariables = (
  endpoint: string,
  request: RESTRequest
): string => {
  return endpoint.replace(
    /:([a-zA-Z0-9-_]+)/g,
    (match, p1) =>
      request.pathVariables.find(
        (pathVariable) => pathVariable.keyString === p1
      )?.value || ''
  )
}
