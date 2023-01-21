/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RESTResponseBase,
  EntityEngineServersideMessages,
  LoadingResult,
  Graph,
  GlobeTestOptions,
} from '@apiteam/types'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

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

  const restResponse: RESTResponseBase & LoadingResult = {
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
    executionAgent: data.executionAgent ?? 'Cloud',
  }

  const responseYMap = new Y.Map()

  Array.from(Object.entries(restResponse)).forEach(([key, value]) =>
    responseYMap.set(key, value)
  )

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
    setTimeout(() => {
      configureGlobetestGraphs(responseYMap, options)
    }, 960)
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

const configureGlobetestGraphs = async (
  responseYMap: Y.Map<any>,
  options: GlobeTestOptions
) => {
  if (!responseYMap.has('graphs')) {
    responseYMap.set('graphs', new Y.Map<Graph>())
  }

  const graphsYMap = responseYMap.get('graphs') as Y.Map<Graph> | undefined

  // If no graph options have been set return
  if (!options.outputConfig?.graphs || !graphsYMap) {
    return
  }

  // Don't configure graphs if they already exist
  if (graphsYMap.size > 0) {
    return
  }

  options.outputConfig.graphs.forEach((graphConfig) => {
    const graph: Graph = {
      __typename: 'Graph',
      id: uuid(),
      name: graphConfig.name,
      description: graphConfig.description ?? undefined,
      series: graphConfig.series.map((seriesConfig) => ({
        loadZone: seriesConfig.loadZone,
        metric: seriesConfig.metric,
        kind: seriesConfig.kind,
        color: seriesConfig.color,
      })),
      desiredWidth: graphConfig.desiredWidth as 1 | 2 | 3,
    }

    graphsYMap.set(graph.id, graph)
  })
}
