/* eslint-disable @typescript-eslint/no-explicit-any */
import { RESTResponse, EntityEngineServersideMessages } from '@apiteam/types'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { configureGlobetestGraphs } from '../utils'

import { cleanupSocket, globeTestState } from '.'

export const restCreateResponse = async (
  data: EntityEngineServersideMessages['rest-create-response'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const globeTestStateCurrent = globeTestState.get(socket)
  if (!globeTestStateCurrent) {
    socket.emit('error', 'Failed to find globeTestStateCurrent')
    return
  }

  if (globeTestStateCurrent.responseId) {
    // Already have a response, so we're done
    return
  }

  const {
    branchId,
    collectionId,
    underlyingRequest,
    finalRequestEndpoint,
    finalRequestHeaders,
    executionAgent,
  } = data

  const restResponsesYMap = projectYMap
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
    ?.get('restResponses') as Y.Map<any> | undefined

  if (!restResponsesYMap) {
    socket.emit('error', 'Failed to find restResponses YMap')
    return
  }

  const restResponse: RESTResponse = {
    id: uuid(),
    __typename: 'RESTResponse',
    parentId: underlyingRequest.id,
    __parentTypename: underlyingRequest.__typename,
    name: underlyingRequest.name,
    method: underlyingRequest.method,
    endpoint: finalRequestEndpoint,
    __subtype: 'LoadingResponse',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    options: null,
    underlyingRequest: {
      ...underlyingRequest,
      headers: Object.entries(finalRequestHeaders).map(
        ([key, value], index) => ({
          id: index,
          variant: 'default',
          keyString: key,
          value,
          enabled: true,
        })
      ),
    },
    source: data.source,
    sourceName: data.sourceName,
    jobId: data.jobId,
    createdByUserId: data.createdByUserId,
    executionAgent,
    localJobId: 'localJobId' in data ? data.localJobId : undefined,
  }

  const responseYMap = new Y.Map()

  Array.from(Object.entries(restResponse)).forEach(([key, value]) => {
    if (value !== undefined) {
      responseYMap.set(key, value)
    }
  })

  restResponsesYMap.set(restResponse.id as string, responseYMap)

  globeTestState.set(socket, {
    ...globeTestStateCurrent,
    responseId: restResponse.id,
  })

  socket.emit('rest-create-response:success', {
    responseId: restResponse.id,
    jobId: data.jobId,
  })
}

export const restAddOptions = async (
  data: EntityEngineServersideMessages['rest-add-options'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const { branchId, collectionId, options } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const globeTestStateCurrent = globeTestState.get(socket)

    if (!globeTestStateCurrent?.responseId) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    const responseYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('restResponses')
      .get(globeTestStateCurrent.responseId) as Y.Map<any> | undefined

    if (!responseYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return responseYMap
  }

  const responseYMap = await getResponseYMap()

  responseYMap.set('options', options)

  if (options.executionMode === 'httpMultiple') {
    configureGlobetestGraphs(responseYMap, options)
  }
}

export const restHandleSuccessSingle = async (
  data: EntityEngineServersideMessages['rest-handle-success-single'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const globeTestStateCurrent = globeTestState.get(socket)

  if (!globeTestStateCurrent) {
    socket.emit('error', 'Failed to find globeTestStateCurrent')
    return
  } else if (!globeTestStateCurrent.responseId) {
    socket.emit('error', 'Failed to find responseId')
    return
  }

  const { branchId, collectionId } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const responseYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('restResponses')
      .get(globeTestStateCurrent.responseId) as Y.Map<any> | undefined

    if (!responseYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return responseYMap
  }

  const responseYMap = await getResponseYMap()

  responseYMap.set('__subtype', 'SuccessSingleResult')
  responseYMap.set('statusCode', data.responseStatus)
  responseYMap.set('response', {
    __typename: 'StoredObject',
    storeReceipt: data.responseStoreReceipt,
    data: null,
  })
  responseYMap.set('meta', {
    responseSize: data.responseSize,
    responseDuration: data.responseDuration,
  })
  responseYMap.set('metrics', {
    __typename: 'StoredObject',
    storeReceipt: data.metricsStoreReceipt,
    data: null,
  })
  responseYMap.set('globeTestLogs', {
    __typename: 'StoredObject',
    storeReceipt: data.globeTestLogsStoreReceipt,
    data: null,
  })
  responseYMap.set('updatedAt', new Date().toISOString())

  cleanupSocket(socket)
}

export const restHandleSuccessMultiple = async (
  data: EntityEngineServersideMessages['rest-handle-success-multiple'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const globeTestStateCurrent = globeTestState.get(socket)

  if (!globeTestStateCurrent) {
    socket.emit('error', 'Failed to find globeTestStateCurrent')
    return
  } else if (!globeTestStateCurrent.responseId) {
    socket.emit('error', 'Failed to find responseId')
    return
  }

  const { branchId, collectionId } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const responseYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('restResponses')
      .get(globeTestStateCurrent.responseId) as Y.Map<any> | undefined

    if (!responseYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return responseYMap
  }

  const responseYMap = await getResponseYMap()

  responseYMap.set('__subtype', 'SuccessMultipleResult')
  responseYMap.set('metrics', {
    __typename: 'StoredObject',
    storeReceipt: data.metricsStoreReceipt,
    data: null,
  })
  responseYMap.set('globeTestLogs', {
    __typename: 'StoredObject',
    storeReceipt: data.globeTestLogsStoreReceipt,
    data: null,
  })

  responseYMap.set('abortedEarly', data.abortedEarly)

  responseYMap.set('updatedAt', new Date().toISOString())

  cleanupSocket(socket)
}

export const restHandleFailure = async (
  data: EntityEngineServersideMessages['rest-handle-failure'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const globeTestStateCurrent = globeTestState.get(socket)
  if (!globeTestStateCurrent) {
    socket.emit('error', 'Failed to find globeTestStateCurrent')
    return
  } else if (!globeTestStateCurrent.responseId) {
    socket.emit('error', 'Failed to find responseId')
    return
  }

  const {
    branchId,
    collectionId,
    globeTestLogsStoreReceipt,
    metricsStoreReceipt,
  } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const responseYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('restResponses')
      .get(globeTestStateCurrent.responseId) as Y.Map<any> | undefined

    if (!responseYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return responseYMap
  }

  const responseYMap = await getResponseYMap()

  responseYMap.set('__subtype', 'FailureResult')

  if (globeTestLogsStoreReceipt !== null) {
    responseYMap.set('globeTestLogs', {
      __typename: 'StoredObject',
      storeReceipt: globeTestLogsStoreReceipt,
      data: null,
    })
  } else {
    responseYMap.set('globeTestLogs', null)
  }

  if (metricsStoreReceipt !== null) {
    responseYMap.set('metrics', {
      __typename: 'StoredObject',
      storeReceipt: metricsStoreReceipt,
      data: null,
    })
  } else {
    responseYMap.set('metrics', null)
  }

  if (responseYMap.get('options') === undefined) {
    responseYMap.set('options', null)
  }

  responseYMap.set('updatedAt', new Date().toISOString())

  cleanupSocket(socket)
}

export const restDeleteResponse = async (
  data: EntityEngineServersideMessages['rest-delete-response'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const { branchId, collectionId, responseId } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const restResponsesYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('restResponses') as Y.Map<any> | undefined

    if (!restResponsesYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return restResponsesYMap
  }

  const restResponsesYMap = await getResponseYMap()

  try {
    restResponsesYMap.delete(responseId)
  } catch (err) {
    socket.emit('error', err)
    console.warn(err)
  }
}
