import {
  AuthenticatedSocket,
  EntityEngineServersideMessages,
  GlobeTestOptions,
  GroupNode,
  WrappedExecutionParams,
} from '@apiteam/types'
import JWT from 'jsonwebtoken'

import { getEntityEngineSocket } from '../entity-engine-socket'
import { RunningTestState, runningTestStates } from '../test-states'

export const folderEnsureResponseExists = async (
  socket: AuthenticatedSocket,
  params: WrappedExecutionParams,
  groupNode: GroupNode,
  jobId: string,
  executionAgent: 'Local' | 'Cloud',
  localJobId?: string
): Promise<void> => {
  const testState = runningTestStates.get(socket)
  if (!testState) throw new Error('Test state not found')

  // So we don't creat
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

    return await folderCreateResponse({
      socket,
      params,
      groupNode,
      jobId,
      executionAgent,
      localJobId,
    })
  }
}

export const folderCreateResponse = async ({
  socket,
  params,
  groupNode,
  jobId,
  executionAgent,
  localJobId,
}: {
  socket: AuthenticatedSocket
  params: WrappedExecutionParams
  groupNode: GroupNode
  jobId: string
  executionAgent: 'Local' | 'Cloud'
  localJobId?: string
}) => {
  if (groupNode.subVariant !== 'Folder') {
    throw new Error(
      'Internal error, expected groupNode to be folder subvariant'
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
    testType: 'Folder',
    jobId,
  })

  const eeParams: EntityEngineServersideMessages['folder-create-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    sourceName: params.testData.rootScript.name,
    source: params.testData.rootScript.contents,
    jobId,
    createdByUserId: userId,
    executionAgent,
    localJobId,
    underlyingFolder: {
      id: groupNode.id,
    },
  }

  entityEngineSocket.emit('folder-create-response', eeParams)
}

export const folderAddOptions = async ({
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

  const eeParams: EntityEngineServersideMessages['folder-add-options'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    options,
  }

  entityEngineSocket.emit('folder-add-options', eeParams)

  const testState = runningTestStates.get(socket)

  if (!testState) throw new Error('Test state not found')

  runningTestStates.set(socket, {
    ...testState,
    options,
  })
}

export const folderHandleSuccess = async ({
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

  const eeParams: EntityEngineServersideMessages['folder-handle-success'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    metricsStoreReceipt,
    globeTestLogsStoreReceipt,
    abortedEarly,
  }

  entityEngineSocket.emit('folder-handle-success-multiple', eeParams)
}

export const folderHandleFailure = async ({
  params,
  globeTestLogsStoreReceipt,
  socket,
  metricsStoreReceipt,
  executionAgent,
}: {
  params: WrappedExecutionParams
  globeTestLogsStoreReceipt: EntityEngineServersideMessages['folder-handle-failure']['globeTestLogsStoreReceipt']
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

  const eeParams: EntityEngineServersideMessages['folder-handle-failure'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    globeTestLogsStoreReceipt,
    metricsStoreReceipt,
  }

  entityEngineSocket.emit('folder-handle-failure', eeParams)
}

export const folderDeleteResponse = async ({
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

  const eeParams: EntityEngineServersideMessages['folder-delete-response'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    responseId: responseId,
  }

  entityEngineSocket.emit('folder-delete-response', eeParams)
}
