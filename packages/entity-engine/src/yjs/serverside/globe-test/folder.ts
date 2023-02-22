/* eslint-disable @typescript-eslint/no-explicit-any */
import { FolderResponse, EntityEngineServersideMessages } from '@apiteam/types'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { configureGlobetestGraphs } from '../utils'

import { cleanupSocket, globeTestState } from '.'

export const folderCreateResponse = async (
  data: EntityEngineServersideMessages['folder-create-response'],
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

  const { branchId, collectionId, executionAgent, underlyingFolder } = data

  const collectionYMap = projectYMap
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId) as Y.Map<any> | undefined

  if (!collectionYMap) {
    socket.emit('error', 'Failed to find collectionYMap')
    return
  }

  // See if folderResponses already exists
  let folderResponsesYMap = collectionYMap.get('folderResponses') as
    | Y.Map<any>
    | undefined

  if (!folderResponsesYMap) {
    // Create folderResponses
    collectionYMap.set('folderResponses', new Y.Map())
  }

  folderResponsesYMap = collectionYMap.get('folderResponses') as
    | Y.Map<any>
    | undefined

  if (!folderResponsesYMap) {
    socket.emit('error', 'Failed to find folderResponses YMap')
    return
  }

  const folderResponse: FolderResponse = {
    id: uuid(),
    __typename: 'FolderResponse',
    parentId: underlyingFolder.id,
    __parentTypename: 'Folder',
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

  Array.from(Object.entries(folderResponse)).forEach(([key, value]) => {
    if (value !== undefined) {
      responseYMap.set(key, value)
    }
  })

  folderResponsesYMap.set(folderResponse.id as string, responseYMap)

  globeTestState.set(socket, {
    ...globeTestStateCurrent,
    responseId: folderResponse.id,
  })

  socket.emit('folder-create-response:success', {
    responseId: folderResponse.id,
    jobId: data.jobId,
  })
}

export const folderAddOptions = async (
  data: EntityEngineServersideMessages['folder-add-options'],
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
      ?.get('folderResponses')
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

export const folderHandleSuccess = async (
  data: EntityEngineServersideMessages['folder-handle-success'],
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
      ?.get('folderResponses')
      .get(globeTestStateCurrent.responseId) as Y.Map<any> | undefined

    if (!responseYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return responseYMap
  }

  const responseYMap = await getResponseYMap()

  responseYMap.set('__subtype', 'SuccessMultipleResult')
  responseYMap.set('testInfo', {
    __typename: 'StoredObject',
    storeReceipt: data.testInfoStoreReceipt,
    data: null,
  })

  responseYMap.set('abortedEarly', data.abortedEarly)

  responseYMap.set('updatedAt', new Date().toISOString())

  cleanupSocket(socket)
}

export const folderHandleFailure = async (
  data: EntityEngineServersideMessages['folder-handle-failure'],
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

  const { branchId, collectionId, testInfoStoreReceipt } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const responseYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('folderResponses')
      .get(globeTestStateCurrent.responseId) as Y.Map<any> | undefined

    if (!responseYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return responseYMap
  }

  const responseYMap = await getResponseYMap()

  responseYMap.set('__subtype', 'FailureResult')

  responseYMap.set('testInfo', {
    __typename: 'StoredObject',
    storeReceipt: testInfoStoreReceipt,
    data: null,
  })

  if (responseYMap.get('options') === undefined) {
    responseYMap.set('options', null)
  }

  responseYMap.set('updatedAt', new Date().toISOString())

  cleanupSocket(socket)
}

export const folderDeleteResponse = async (
  data: EntityEngineServersideMessages['folder-delete-response'],
  projectYMap: Y.Map<any>,
  socket: Socket
) => {
  const { branchId, collectionId, responseId } = data

  const getResponseYMap = async (): Promise<Y.Map<any>> => {
    const folderResponsesYMap = projectYMap
      ?.get('branches')
      ?.get(branchId)
      ?.get('collections')
      ?.get(collectionId)
      ?.get('folderResponses') as Y.Map<any> | undefined

    if (!folderResponsesYMap) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return getResponseYMap()
    }

    return folderResponsesYMap
  }

  const folderResponsesYMap = await getResponseYMap()

  try {
    folderResponsesYMap.delete(responseId)
  } catch (err) {
    socket.emit('error', err)
    console.warn(err)
  }
}
