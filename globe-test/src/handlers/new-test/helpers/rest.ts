import {
  EntityEngineServersideMessages,
  GlobeTestOptions,
  WrappedExecutionParams,
} from '@apiteam/types'
import JWT from 'jsonwebtoken'
import { Response } from 'k6/http'
import { Socket } from 'socket.io'

import { TestRunningState, runningTestStates } from '..'
import { uploadScopedResource } from '../../../services/upload-scoped-resource'
import { estimateRESTResponseSize, getEntityEngineSocket } from '../utils'

export const restCreateResponse = async ({
  socket,
  params,
  jobId,
}: {
  socket: Socket
  params: WrappedExecutionParams
  jobId: string
}) => {
  if (!params.finalRequest) {
    socket.emit('error', 'Missing finalRequest parameter')
    socket.disconnect()
    return
  }

  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  // Decode bearer token, don't need to check if it's valid
  const { userId } = JWT.decode(params.bearer) as {
    userId: string
  }

  runningTestStates.set(socket, {
    ...(runningTestStates.get(socket) as TestRunningState),
    testType: 'rest',
    jobId,
  })

  const eeParams: EntityEngineServersideMessages['rest-create-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    underlyingRequest: params.underlyingRequest,
    finalRequestEndpoint: params.finalRequest.url,
    source: params.source,
    sourceName: params.sourceName,
    jobId,
    createdByUserId: userId,
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
  if (!params.finalRequest) {
    socket.emit('error', 'Missing finalRequest parameter')
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
    resourceName: `Response:${responseId}:response.json`,
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

export const restHandleSuccessMultiple = async ({
  params,
  globeTestLogsStoreReceipt,
  metricsStoreReceipt,
  socket,
}: {
  params: WrappedExecutionParams
  globeTestLogsStoreReceipt: string
  metricsStoreReceipt: string
  socket: Socket
}) => {
  console.log('restHandleSuccessMultiple')

  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  const eeParams: EntityEngineServersideMessages['rest-handle-success-multiple'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      metricsStoreReceipt,
      globeTestLogsStoreReceipt,
    }

  entityEngineSocket.emit('rest-handle-success-multiple', eeParams)
}

export const restHandleFailure = async ({
  params,
  globeTestLogsStoreReceipt,
  socket,
  metricsStoreReceipt,
}: {
  params: WrappedExecutionParams
  globeTestLogsStoreReceipt: EntityEngineServersideMessages['rest-handle-failure']['globeTestLogsStoreReceipt']
  socket: Socket
  metricsStoreReceipt: string | null
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
    metricsStoreReceipt,
  }

  entityEngineSocket.emit('rest-handle-failure', eeParams)
}
