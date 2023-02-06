import {
  AuthenticatedSocket,
  EntityEngineServersideMessages,
  GlobeTestOptions,
  HTTPRequestNode,
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
  httpRequestNode: HTTPRequestNode,
  jobId: string,
  executionAgent: 'Local' | 'Cloud',
  localJobId?: string
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

    return await restCreateResponse({
      socket,
      params,
      httpRequestNode,
      jobId,
      executionAgent,
      localJobId,
    })
  }
}

export const restCreateResponse = async ({
  socket,
  params,
  httpRequestNode,
  jobId,
  executionAgent,
  localJobId,
}: {
  socket: AuthenticatedSocket
  params: WrappedExecutionParams
  httpRequestNode: HTTPRequestNode
  jobId: string
  executionAgent: 'Local' | 'Cloud'
  localJobId?: string
}) => {
  if (
    !('subVariant' in httpRequestNode) ||
    httpRequestNode.subVariant !== 'RESTRequest'
  ) {
    throw new Error(
      'Internal error, expected httpRequestNode to be rest subvariant'
    )
  }

  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    executionAgent
  )

  // Decode bearer token, don't need to check if it's valid
  const { userId } = JWT.decode(params.bearer) as {
    userId: string
  }

  runningTestStates.set(socket, {
    ...(runningTestStates.get(socket) as RunningTestState),
    testType: 'RESTRequest',
    jobId,
  })

  const eeParams: EntityEngineServersideMessages['rest-create-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    underlyingRequest: httpRequestNode.underlyingRequest,
    finalRequestEndpoint: httpRequestNode.finalRequest.url,
    finalRequestHeaders: httpRequestNode.finalRequest.params?.headers ?? {},
    sourceName: params.testData.rootScript.name,
    source: params.testData.rootScript.contents,
    jobId,
    createdByUserId: userId,
    executionAgent,
    localJobId,
  }

  entityEngineSocket.emit('rest-create-response', eeParams)
}

export const restAddOptions = async ({
  socket,
  params,
  options,
  executionAgent,
}: {
  socket: AuthenticatedSocket
  params: WrappedExecutionParams
  options: GlobeTestOptions
  executionAgent: 'Local' | 'Cloud'
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    executionAgent
  )

  const eeParams: EntityEngineServersideMessages['rest-add-options'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    options,
  }

  entityEngineSocket.emit('rest-add-options', eeParams)

  const testState = runningTestStates.get(socket)

  if (!testState) throw new Error('Test state not found')

  runningTestStates.set(socket, {
    ...testState,
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
  executionAgent,
}: {
  params: WrappedExecutionParams
  response: Response
  responseId: string
  globeTestLogsStoreReceipt: string
  metricsStoreReceipt: string
  socket: AuthenticatedSocket
  executionAgent: 'Local' | 'Cloud'
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    executionAgent
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
  executionAgent,
  abortedEarly,
}: {
  params: WrappedExecutionParams
  globeTestLogsStoreReceipt: string
  metricsStoreReceipt: string
  socket: AuthenticatedSocket
  executionAgent: 'Local' | 'Cloud'
  abortedEarly: boolean
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    executionAgent
  )

  const eeParams: EntityEngineServersideMessages['rest-handle-success-multiple'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      metricsStoreReceipt,
      globeTestLogsStoreReceipt,
      abortedEarly,
    }

  entityEngineSocket.emit('rest-handle-success-multiple', eeParams)
}

export const restHandleFailure = async ({
  params,
  globeTestLogsStoreReceipt,
  socket,
  metricsStoreReceipt,
  executionAgent,
}: {
  params: WrappedExecutionParams
  globeTestLogsStoreReceipt: EntityEngineServersideMessages['rest-handle-failure']['globeTestLogsStoreReceipt']
  socket: AuthenticatedSocket
  metricsStoreReceipt: string | null
  executionAgent: 'Local' | 'Cloud'
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    executionAgent
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
  executionAgent,
}: {
  params: WrappedExecutionParams
  socket: AuthenticatedSocket
  responseId: string
  executionAgent: 'Local' | 'Cloud'
}) => {
  const entityEngineSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    executionAgent
  )

  const eeParams: EntityEngineServersideMessages['rest-delete-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    responseId: responseId,
  }

  entityEngineSocket.emit('rest-delete-response', eeParams)
}
