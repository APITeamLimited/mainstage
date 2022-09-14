import { RESTRequest, Environment } from '@apiteam/types'
import { AxiosRequestConfig } from 'axios'
import qs from 'qs'

import { findEnvironmentVariables } from 'src/utils/findVariables'

/*
Gets final axios config for a request, complete with environment variables
*/
export const getFinalRequest = (
  request: RESTRequest,
  activeEnvironment: Environment | null
): AxiosRequestConfig => {
  let body = null

  if (request.body.contentType === null) {
    body = null
  } else if (request.body.contentType === 'application/x-www-form-urlencoded') {
    body = qs.stringify(
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

  const withAuthRequest = addAuthToRequest(activeEnvironment, request, {
    method: request.method,
    url: request.endpoint,
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
  })

  return makeEnvironmentAwareRequest(withAuthRequest, activeEnvironment)
}

const addAuthToRequest = (
  activeEnvironment: Environment | null,
  request: RESTRequest,
  axiosConfig: AxiosRequestConfig
): AxiosRequestConfig => {
  const { auth } = request

  if (!auth.authActive) {
    return axiosConfig
  }

  if (auth.authType === 'none') {
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
          [findEnvironmentVariables(activeEnvironment, auth.key)]:
            findEnvironmentVariables(activeEnvironment, auth.value),
        },
      }
    } else if (auth.addTo === 'query') {
      return {
        ...axiosConfig,
        params: {
          ...axiosConfig.params,
          [findEnvironmentVariables(activeEnvironment, auth.key)]:
            findEnvironmentVariables(activeEnvironment, auth.value),
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
  config: AxiosRequestConfig,
  activeEnvironment: Environment | null
): AxiosRequestConfig => {
  return {
    ...config,
    url: findEnvironmentVariables(activeEnvironment, config.url || ''),

    // Search for environment variables in header keys and values
    headers: Object.entries(config.headers || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(activeEnvironment, key)]:
          findEnvironmentVariables(activeEnvironment, String(value)),
      }),
      {}
    ),

    // Search for environment variables in params keys and values
    params: Object.entries(config.params || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(activeEnvironment, key)]:
          findEnvironmentVariables(activeEnvironment, String(value)),
      }),
      {}
    ),

    data: config.data
      ? findEnvironmentVariables(activeEnvironment, config.data)
      : null,
  }
}
