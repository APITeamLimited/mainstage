import {
  WrappedExecutionParams,
  GlobeTestMessage,
  ExecutionParams,
  AuthenticatedSocket,
  RunningTestInfo,
} from '@apiteam/types'
import type { Scope } from '@prisma/client'
import { parse } from 'query-string'
import { v4 as uuid } from 'uuid'

import {
  coreCacheReadRedis,
  orchestratorReadRedis,
  orchestratorSubscribeRedis,
} from '../redis'
import { validateParams } from '../validator'

import {
  getEntityEngineSocket,
  runningTestStates,
  restDeleteResponse,
  parseMessage,
  handleMessage,
} from './helpers'

export const getLocalTestLogsKey = (scope: Scope) =>
  `workspace-local-test-logs:${scope.variant}:${scope.variantTargetId}${scope.userId}`
export const getLocalTestUpdatesKey = (scope: Scope) =>
  `workspace-local-test-updates:${scope.variant}:${scope.variantTargetId}${scope.userId}`

export const handleNewLocalTest = async (socket: AuthenticatedSocket) => {
  let params = null as WrappedExecutionParams | null

  try {
    params = validateParams(parse(socket.request.url?.split('?')[1] || ''))
    if (!params) throw new Error('Invalid params')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // Close the socket if the params are invalid
    socket.emit('error', e.message)
    socket.disconnect()
    return
  }

  const runningTestKey = `workspace-local-tests:${socket.scope.variant}:${socket.scope.variantTargetId}${socket.scope.userId}`
  coreCacheReadRedis.del(runningTestKey)
  // Check workspace hasn't already got too many tests already running
  if ((await coreCacheReadRedis.hLen(runningTestKey)) > 5) {
    socket.emit('error', 'You can only run 5 tests at once in a workspace')
    socket.disconnect()
    return
  }

  runningTestStates.set(socket, {
    testType: 'undetermined',
    responseExistence: 'none',
  })

  await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId
  )

  const executionParams: ExecutionParams = {
    id: uuid(),
    source: params.source,
    sourceName: params.sourceName,
    environmentContext: params.environmentContext,
    collectionContext: params.collectionContext,
    finalRequest: params.finalRequest,
    underlyingRequest: params.underlyingRequest,
    scope: {
      variant: socket.scope.variant as 'USER' | 'TEAM',
      variantTargetId: socket.scope.variantTargetId,
      userId: socket.scope.userId,
    },
    verifiedDomains: [],
    createdAt: new Date().toISOString(),
  }

  const jobLogsKey = getLocalTestLogsKey(socket.scope)
  const jobUpdatesKey = getLocalTestUpdatesKey(socket.scope)

  orchestratorSubscribeRedis.subscribe(jobUpdatesKey, (message) => {
    const messageObject = parseMessage(JSON.parse(message)) as GlobeTestMessage

    socket.emit('updates', messageObject)

    handleMessage(
      messageObject,
      socket,
      params as WrappedExecutionParams,
      executionParams.id,
      runningTestKey,
      'Local'
    )
  })

  // To enable compatability with cloud tests we need to store the test info in redis
  socket.on('globeTestMessage', (msg: GlobeTestMessage) => {
    const stringifiedMessage = JSON.stringify({
      ...msg,
      message: JSON.stringify(msg.message),
    })
    orchestratorReadRedis.sAdd(jobLogsKey, stringifiedMessage)
    orchestratorReadRedis.publish(jobUpdatesKey, stringifiedMessage)
  })

  socket.on('disconnect', () => {
    coreCacheReadRedis.hDel(runningTestKey, executionParams.id)

    const testState = runningTestStates.get(socket)

    if (!testState) {
      console.warn('Test state not found')
      return
    }

    // Delete the response if the test was abruptly stopped
    if (!testState.localCompleted) {
      if (testState.testType === 'rest' && testState.responseId) {
        restDeleteResponse({
          params: params as WrappedExecutionParams,
          socket,
          responseId: testState.responseId,
        })
      }
    }

    runningTestStates.delete(socket)

    orchestratorSubscribeRedis.unsubscribe(jobUpdatesKey)
    orchestratorReadRedis.del(jobLogsKey)

    console.log('Test disconnected')
  })

  const runningTestInfo: RunningTestInfo = {
    jobId: executionParams.id,
    sourceName: executionParams.sourceName,
    createdByUserId: socket.scope.userId,
    createdAt: executionParams.createdAt,
    status: 'ASSIGNED',
  }

  await coreCacheReadRedis.hSet(
    runningTestKey,
    runningTestInfo.jobId,
    JSON.stringify(runningTestInfo)
  )
}
