/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityEngineServersideMessages } from '@apiteam/types'
import { parse } from 'query-string'
import { Socket } from 'socket.io'
import * as Y from 'yjs'

import {
  restAddOptions,
  restCreateResponse,
  restHandleFailure,
  restHandleSuccessMultiple,
  restHandleSuccessSingle,
  restDeleteResponse,
} from './rest'

type GlobeTestState = {
  testType: 'RESTRequest'
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

  globeTestState.set(socket, {
    testType: 'RESTRequest',
  })

  socket.on('disconnect', () => {
    globeTestState.delete(socket)
  })

  socket.on(
    'rest-create-response',
    (data: EntityEngineServersideMessages['rest-create-response']) =>
      restCreateResponse(data, projectYMap, socket)
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
}

export const cleanupSocket = (socket: Socket) => {
  socket.disconnect(true)
  globeTestState.delete(socket)
}
