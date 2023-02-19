/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionResponse,
  EntityEngineServersideMessages,
} from '@apiteam/types'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { configureGlobetestGraphs } from '../utils'

import { cleanupSocket, globeTestState } from '.'

export const collectionCreateResponse = async (
  data: EntityEngineServersideMessages['collection-create-response'],
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

  const { branchId, collectionId, executionAgent } = data

  const collectionYMap = projectYMap
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId) as Y.Map<any> | undefined

  if (!collectionYMap) {
    socket.emit('error', 'Failed to find collectionYMap')
    return
  }

  // See if collectionResponses already exists
  let collectionResponsesYMap = collectionYMap.get('collectionResponses') as
    | Y.Map<any>
    | undefined

  if (!collectionResponsesYMap) {
    // Create collectionResponses
    collectionYMap.set('collectionResponses', new Y.Map())
  }

  collectionResponsesYMap = collectionYMap.get('collectionResponses') as
    | Y.Map<any>
    | undefined

  if (!collectionResponsesYMap) {
    socket.emit('error', 'Failed to find collectionResponses YMap')
    return
  }

  const collectionResponse: CollectionResponse = {
    id: uuid(),
    __typename: 'CollectionResponse',
    parentId: collectionId,
    __parentTypename: 'Collection',
    __subtype: 'LoadingResponse',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    options: null,
    source: data.source,
    sourceName: data.sourceName,
    jobId: data.jobId,
    createdByUserId: data.createdByUserId,
    executionAgent,
    localJobId: 'localJobId' in data ? data.localJobId : undefined,
  }

  const responseYMap = new Y.Map()

  Array.from(Object.entries(collectionResponse)).forEach(([key, value]) => {
    if (value !== undefined) {
      responseYMap.set(key, value)
    }
  })

  collectionResponsesYMap.set(collectionResponse.id as string, responseYMap)

  globeTestState.set(socket, {
    ...globeTestStateCurrent,
    responseId: collectionResponse.id,
  })

  socket.emit('collection-create-response:success', {
    responseId: collectionResponse.id,
    jobId: data.jobId,
  })
}

export const collectionAddOptions = async (
  data: EntityEngineServersideMessages['collection-add-options'],
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
      ?.get('collectionResponses')
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

export const collectionHandleSuccess = async (
  data: EntityEngineServersideMessages['collection-handle-success'],
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
      ?.get('collectionResponses')
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

export const collectionHandleFailure = async (
  data: EntityEngineServersideMessages['collection-handle-failure'],
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
      ?.get('collectionResponses')
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

export const collectionDeleteResponse = async (
  data: EntityEngineServersideMessages['collection-delete-response'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const { branchId, collectionId, responseId } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const collectionResponsesYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('collectionResponses') as Y.Map<any> | undefined

    if (!collectionResponsesYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return collectionResponsesYMap
  }

  const collectionResponsesYMap = await getResponseYMap()

  try {
    collectionResponsesYMap.delete(responseId)
  } catch (err) {
    socket.emit('error', err)
    console.warn(err)
  }
}
