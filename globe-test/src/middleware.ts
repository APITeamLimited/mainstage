import { IncomingMessage } from 'http'

import queryString from 'query-string'

import { orchestratorReadRedis } from './redis'

/*
Checks that the HttpRequest has the required query parameters.
*/
export const checkValidQueryParams = (request: IncomingMessage) => {
  const params = queryString.parse(request.url?.split('?')[1] || '')

  const requiredParams = ['sourceName', 'source']

  for (const param of requiredParams) {
    if (!params[param]) {
      return false
    }
  }

  return true
}

/*
Checks a running job is in scope
*/
export const checkJobId = async (request: IncomingMessage) => {
  const params = queryString.parse(request.url?.split('?')[1] || '')

  const jobId = params['jobId']

  if (!jobId) {
    return false
  }

  // Ensure jobId is not array
  if (Array.isArray(jobId)) {
    return false
  }

  // scopeId already been checked in auth middleware
  const scopeId = params.scopeId?.toString() || undefined

  if (!scopeId) {
    return false
  }

  // Get job from orchestratorReadRedis
  const foundScopeId = await orchestratorReadRedis.hGet(jobId, 'scopeId')

  if (!foundScopeId) {
    return false
  }

  return foundScopeId === scopeId
}
