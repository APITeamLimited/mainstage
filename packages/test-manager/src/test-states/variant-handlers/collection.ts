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

export const collectionEnsureResponseExists = async (
  socket: AuthenticatedSocket,
  params: WrappedExecutionParams,
  groupNode: GroupNode,
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

    return await collectionCreateResponse({
      socket,
      params,
      groupNode,
      jobId,
      executionAgent,
      localJobId,
    })
  }
}

export const collectionCreateResponse = async ({
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
  if (groupNode.subVariant !== 'Collection') {
    throw new Error(
      'Internal error, expected groupNode to be collection subvariant'
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
    testType: 'Collection',
    jobId,
  })

  const eeParams: EntityEngineServersideMessages['collection-create-response'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      sourceName: params.testData.rootScript.name,
      source: params.testData.rootScript.contents,
      jobId,
      createdByUserId: userId,
      executionAgent,
      localJobId,
    }

  entityEngineSocket.emit('collection-create-response', eeParams)
}

export const collectionAddOptions = async ({
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

  const eeParams: EntityEngineServersideMessages['collection-add-options'] = {
    branchId: params.branchId,
    collectionId: params.collectionId,
    options,
  }

  entityEngineSocket.emit('collection-add-options', eeParams)

  const testState = runningTestStates.get(socket)

  if (!testState) throw new Error('Test state not found')

  runningTestStates.set(socket, {
    ...testState,
    options,
  })
}

export const collectionHandleSuccess = async ({
  params,
  testInfoStoreReceipt,
  socket,
  executionAgent,
  abortedEarly,
}: {
  params: WrappedExecutionParams
  testInfoStoreReceipt: string
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

  const eeParams: EntityEngineServersideMessages['collection-handle-success'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      testInfoStoreReceipt,
      abortedEarly,
    }

  entityEngineSocket.emit('collection-handle-success', eeParams)
}

export const collectionHandleFailure = async ({
  params,
  testInfoStoreReceipt,
  socket,
  executionAgent,
}: {
  params: WrappedExecutionParams
  testInfoStoreReceipt: EntityEngineServersideMessages['collection-handle-failure']['testInfoStoreReceipt']
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

  const eeParams: EntityEngineServersideMessages['collection-handle-failure'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      testInfoStoreReceipt,
    }

  entityEngineSocket.emit('collection-handle-failure', eeParams)
}

export const collectionDeleteResponse = async ({
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

  const eeParams: EntityEngineServersideMessages['collection-delete-response'] =
    {
      branchId: params.branchId,
      collectionId: params.collectionId,
      responseId: responseId,
    }

  entityEngineSocket.emit('collection-delete-response', eeParams)
}
