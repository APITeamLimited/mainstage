/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityEngineServersideMessages } from '@apiteam/types'
import { parse } from 'query-string'
import { Socket } from 'socket.io'
import * as Y from 'yjs'

import {
  collectionAddOptions,
  collectionCreateResponse,
  collectionHandleFailure,
  collectionHandleSuccess,
  collectionDeleteResponse,
} from './collection'
import {
  folderAddOptions,
  folderCreateResponse,
  folderHandleFailure,
  folderHandleSuccess,
  folderDeleteResponse,
} from './folder'
import {
  restAddOptions,
  restCreateResponse,
  restHandleFailure,
  restHandleSuccessMultiple,
  restHandleSuccessSingle,
  restDeleteResponse,
} from './rest'

type GlobeTestState = {
  testType: 'RESTRequest' | 'Folder' | 'Collection'
  responseId?: string
}

export const globeTestState = new Map<Socket, GlobeTestState>()

export const handleGlobetest = (socket: Socket, doc: Y.Doc) => {
  const queryParams = parse(socket.request.url?.split('?')[1] || '')

  const projectId = queryParams.projectId?.toString()

  if (!projectId || projectId.length === 0) {
    socket.emit('error', 'No projectId provided')
    socket.disconnect(true)
    return
  }

  // Get the project
  const projectYMap = doc.getMap('projects').get(projectId) as
    | Y.Map<any>
    | undefined

  if (!projectYMap) {
    socket.emit('error', 'Project not found')
    socket.disconnect(true)
    return
  }

  let setTestType = false

  globeTestState.set(socket, {
    testType: 'RESTRequest',
  })

  socket.on('disconnect', () => {
    globeTestState.delete(socket)
  })

  socket.on(
    'rest-create-response',
    (data: EntityEngineServersideMessages['rest-create-response']) => {
      if (!setTestType) {
        globeTestState.set(socket, {
          testType: 'RESTRequest',
        })
        setTestType = true
      }

      restCreateResponse(data, projectYMap, socket)
    }
  )

  socket.on(
    'rest-add-options',
    (data: EntityEngineServersideMessages['rest-add-options']) =>
      restAddOptions(data, projectYMap, socket)
  )

  socket.on(
    'rest-handle-success-single',
    (data: EntityEngineServersideMessages['rest-handle-success-single']) =>
      restHandleSuccessSingle(data, projectYMap, socket)
  )

  socket.on(
    'rest-handle-success-multiple',
    (data: EntityEngineServersideMessages['rest-handle-success-multiple']) =>
      restHandleSuccessMultiple(data, projectYMap, socket)
  )

  socket.on(
    'rest-handle-failure',
    (data: EntityEngineServersideMessages['rest-handle-failure']) =>
      restHandleFailure(data, projectYMap, socket)
  )

  socket.on(
    'rest-delete-response',
    (data: EntityEngineServersideMessages['rest-delete-response']) =>
      restDeleteResponse(data, projectYMap, socket)
  )

  socket.on(
    'folder-create-response',
    (data: EntityEngineServersideMessages['folder-create-response']) => {
      if (!setTestType) {
        globeTestState.set(socket, {
          testType: 'Folder',
        })
        setTestType = true
      }

      folderCreateResponse(data, projectYMap, socket)
    }
  )

  socket.on(
    'folder-add-options',
    (data: EntityEngineServersideMessages['folder-add-options']) =>
      folderAddOptions(data, projectYMap, socket)
  )

  socket.on(
    'folder-handle-success',
    (data: EntityEngineServersideMessages['folder-handle-success']) =>
      folderHandleSuccess(data, projectYMap, socket)
  )

  socket.on(
    'folder-handle-failure',
    (data: EntityEngineServersideMessages['folder-handle-failure']) =>
      folderHandleFailure(data, projectYMap, socket)
  )

  socket.on(
    'folder-delete-response',
    (data: EntityEngineServersideMessages['folder-delete-response']) =>
      folderDeleteResponse(data, projectYMap, socket)
  )

  socket.on(
    'collection-create-response',
    (data: EntityEngineServersideMessages['collection-create-response']) => {
      if (!setTestType) {
        globeTestState.set(socket, {
          testType: 'Collection',
        })
        setTestType = true
      }

      collectionCreateResponse(data, projectYMap, socket)
    }
  )

  socket.on(
    'collection-add-options',
    (data: EntityEngineServersideMessages['collection-add-options']) =>
      collectionAddOptions(data, projectYMap, socket)
  )

  socket.on(
    'collection-handle-success',
    (data: EntityEngineServersideMessages['collection-handle-success']) =>
      collectionHandleSuccess(data, projectYMap, socket)
  )

  socket.on(
    'collection-handle-failure',
    (data: EntityEngineServersideMessages['collection-handle-failure']) =>
      collectionHandleFailure(data, projectYMap, socket)
  )

  socket.on(
    'collection-delete-response',
    (data: EntityEngineServersideMessages['collection-delete-response']) =>
      collectionDeleteResponse(data, projectYMap, socket)
  )
}

export const cleanupSocket = (socket: Socket) => {
  socket.disconnect(true)
  globeTestState.delete(socket)
}
