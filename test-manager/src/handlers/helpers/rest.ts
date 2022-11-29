import {
  AuthenticatedSocket,
  EntityEngineServersideMessages,
  GlobeTestOptions,
  RESTResponse,
  WrappedExecutionParams,
} from '@apiteam/types'
import JWT from 'jsonwebtoken'
import { Response } from 'k6/http'

import { uploadScopedResource } from '../../services/upload-scoped-resource'

import { RunningTestState, runningTestStates } from './test-states'
import { estimateRESTResponseSize, getEntityEngineSocket } from './utils'

export const ensureRESTResponseExists = async (
  socket: AuthenticatedSocket,
  params: WrappedExecutionParams,
  jobId: string,
  executionAgent: RESTResponse['executionAgent']
): Promise<void> => {
  const testState = runningTestStates.get(socket)
  if (!testState) throw new Error('Test state not found')

  if (
    testState.responseExistence === 'created' ||
    testState.responseExistence === 'creating'
  ) {
    return
  }

  if (
    jobId !== testState.jobId &&
    testState.testType === 'undetermined' &&
    testState.responseExistence === 'none'
  ) {
    runningTestStates.set(socket, {
      ...(runningTestStates.get(socket) as RunningTestState),
      responseExistence: 'creating',
    })

    return await restCreateResponse({ socket, params, jobId, executionAgent })
  }
}

export const restCreateResponse = async ({
  socket,
  params,
  jobId,
  executionAgent,
}: {
  socket: AuthenticatedSocket
  params: WrappedExecutionParams
  jobId: string
  executionAgent: RESTResponse['executionAgent']
}) => {
  if (!params.finalRequest) {
    socket.emit('error', 'Missing finalRequest parameter')
    socket.disconnect()
    return
  }

  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId
  )

  // Decode bearer token, don't need to check if it's valid
  const { userId } = JWT.decode(params.bearer) as {
    userId: string
  }

  runningTestStates.set(socket, {
    ...(runningTestStates.get(socket) as RunningTestState),
    testType: 'rest',
    jobId,
  })

  const eeParams: EntityEngineServersideMessages['rest-create-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    underlyingRequest: params.underlyingRequest,
    finalRequestEndpoint: params.finalRequest.url,
    finalRequestHeaders: params.finalRequest.params?.headers ?? {},
    source: params.source,
    sourceName: params.sourceName,
    jobId,
    createdByUserId: userId,
    executionAgent,
  }

  entityEngineSocket.emit('rest-create-response', eeParams)
}

export const restAddOptions = async ({
  socket,
  params,
  options,
}: {
  socket: AuthenticatedSocket
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
    socket.scope,
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
    ...(runningTestStates.get(socket) as RunningTestState),
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
  socket: AuthenticatedSocket
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
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
  socket: AuthenticatedSocket
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
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
  socket: AuthenticatedSocket
  metricsStoreReceipt: string | null
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
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

export const restDeleteResponse = async ({
  params,
  socket,
  responseId,
}: {
  params: WrappedExecutionParams
  socket: AuthenticatedSocket
  responseId: string
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId
  )

  const eeParams: EntityEngineServersideMessages['rest-delete-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    responseId: responseId,
  }

  entityEngineSocket.emit('rest-delete-response', eeParams)
}
