import {
  EntityEngineServersideMessages,
  GlobeTestOptions,
  WrappedExecutionParams,
} from '@apiteam/types'
import { Response } from 'k6/http'
import { Socket } from 'socket.io'

import { uploadScopedResource } from '../../services/upload-scoped-resource'

import { estimateRESTResponseSize, getEntityEngineSocket } from './utils'

import { TestRunningState, runningTestStates } from '.'

export const restCreateResponse = async ({
  socket,
  params,
  jobId,
}: {
  socket: Socket
  params: WrappedExecutionParams
  jobId: string
}) => {
  if (!params.restRequest) {
    socket.emit('error', 'Missing restRequest parameter')
    socket.disconnect()
    return
  }

  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  runningTestStates.set(socket, {
    ...(runningTestStates.get(socket) as TestRunningState),
    testType: 'rest',
    jobId,
  })

  const eeParams: EntityEngineServersideMessages['rest-create-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    underlyingRequest: params.underlyingRequest,
    finalRequestEndpoint: params.restRequest.url,
    source: params.source,
    sourceName: params.sourceName,
    jobId,
  }

  entityEngineSocket.emit('rest-create-response', eeParams)
}

export const restAddOptions = async ({
  socket,
  params,
  options,
}: {
  socket: Socket
  params: WrappedExecutionParams
  options: GlobeTestOptions
}) => {
  if (!params.restRequest) {
    socket.emit('error', 'Missing restRequest parameter')
    socket.disconnect()
    return
  }

  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  const eeParams: EntityEngineServersideMessages['rest-add-options'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    options,
  }

  entityEngineSocket.emit('rest-add-options', eeParams)

  runningTestStates.set(socket, {
    ...(runningTestStates.get(socket) as TestRunningState),
    options,
  })
}

export const restHandleSuccessSingle = async ({
  params,
  response,
  responseId,
  globeTestLogsStoreReceipt,
  metricsStoreReceipt,
  socket,
}: {
  params: WrappedExecutionParams
  response: Response
  responseId: string
  globeTestLogsStoreReceipt: string
  metricsStoreReceipt: string
  socket: Socket
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  const responseStoreReceipt = await uploadScopedResource({
    scopeId: params.scopeId,
    rawBearer: params.bearer,
    // eslint-disable-next-line new-cap
    resource: Buffer.from(JSON.stringify(response)),
    resourceName: `RESTResponse:${responseId}:response.json`,
  })

  const eeParams: EntityEngineServersideMessages['rest-handle-success-single'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      responseStatus: response.status,
      responseSize: estimateRESTResponseSize(response),
      responseDuration: response.timings.duration,
      responseStoreReceipt,
      metricsStoreReceipt,
      globeTestLogsStoreReceipt,
    }

  entityEngineSocket.emit('rest-handle-success-single', eeParams)
}

export const restHandleFailure = async ({
  params,
  globeTestLogsStoreReceipt,
  socket,
}: {
  params: WrappedExecutionParams
  globeTestLogsStoreReceipt: EntityEngineServersideMessages['rest-handle-failure']['globeTestLogsStoreReceipt']
  socket: Socket
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  const eeParams: EntityEngineServersideMessages['rest-handle-failure'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    globeTestLogsStoreReceipt,
  }

  entityEngineSocket.emit('rest-handle-failure', eeParams)
}
