import {
  WrappedExecutionParams,
  GlobeTestMessage,
  ExecutionParams,
  AuthenticatedSocket,
  RunningTestInfo,
  parseAndValidateGlobeTestMessage,
  parseGlobeTestMessage,
  GLOBETEST_METRICS,
  GLOBETEST_LOGS,
} from '@apiteam/types'
import type { Scope } from '@prisma/client'
import { parse } from 'query-string'
import { v4 as uuid } from 'uuid'

import {
  getCoreCacheReadRedis,
  getOrchestratorReadRedis,
  getOrchestratorSubscribeRedis,
} from '../redis'
import { validateParams } from '../validator'

import {
  getEntityEngineSocket,
  runningTestStates,
  restDeleteResponse,
  handleMessage,
} from './helpers'

export const getLocalTestLogsKey = (scope: Scope, jobId: string) =>
  `workspace-local-test-logs:${scope.variant}:${scope.variantTargetId}:${jobId}`
export const getLocalTestUpdatesKey = (scope: Scope, jobId: string) =>
  `workspace-local-test-updates:${scope.variant}:${scope.variantTargetId}${jobId}`

export const handleNewLocalTest = async (socket: AuthenticatedSocket) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()
  const orchestratorReadRedis = await getOrchestratorReadRedis()
  const orchestratorSubscribeRedis = await getOrchestratorSubscribeRedis()

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

  const eeSocket = await getEntityEngineSocket(
    socket,
    socket.scope,
    params.bearer,
    params.projectId,
    'Local'
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
    funcModeInfo: null,
  }

  const jobLogsKey = getLocalTestLogsKey(socket.scope, executionParams.id)
  const jobUpdatesKey = getLocalTestUpdatesKey(socket.scope, executionParams.id)

  orchestratorSubscribeRedis.subscribe(jobUpdatesKey, (message) => {
    const parseResult = parseAndValidateGlobeTestMessage(message)

    if (!parseResult.success) {
      return
    }

    socket.emit('updates', parseResult.data)

    handleMessage(
      parseResult.data,
      socket,
      params as WrappedExecutionParams,
      executionParams.id,
      runningTestKey,
      'Local'
    )
  })

  let terminationMessage: string | null = null
  let storedGlobeTestLogs = false
  let storedMetrics = false

  let consoleLogCount = 0

  // To enable compatability with cloud tests we need to store the test info in redis
  socket.on('globeTestMessage', async (msg: unknown) => {
    const parseResult = parseAndValidateGlobeTestMessage(msg)

    if (!parseResult.success) {
      socket.emit('error', 'Invalid message')
      socket.disconnect()

      console.error(
        'Invalid message',
        parseGlobeTestMessage(msg),
        parseResult.error
      )

      return
    }

    if (parseResult.data.messageType === 'CONSOLE') {
      consoleLogCount += 1

      if (consoleLogCount >= 100) {
        return
      }
    }

    const parsedMessage = parseResult.data

    const stringifiedMessage = correctCloudID(parsedMessage, executionParams.id)
    orchestratorReadRedis.sAdd(jobLogsKey, stringifiedMessage)
    orchestratorReadRedis.publish(jobUpdatesKey, stringifiedMessage)

    if (
      parsedMessage.messageType === 'STATUS' &&
      parsedMessage.senderVariant === 'Orchestrator' &&
      (parsedMessage.message === 'COMPLETED_SUCCESS' ||
        parsedMessage.message === 'COMPLETED_FAILURE')
    ) {
      terminationMessage = correctCloudID(parsedMessage, executionParams.id)

      if (storedGlobeTestLogs && storedMetrics) {
        orchestratorReadRedis.set(jobLogsKey, terminationMessage)
        orchestratorReadRedis.publish(jobUpdatesKey, terminationMessage)
      }
    }

    if (
      parsedMessage.messageType === 'MARK' &&
      parsedMessage.message.mark === GLOBETEST_LOGS
    ) {
      storedGlobeTestLogs = true
    } else if (
      parsedMessage.messageType === 'MARK' &&
      parsedMessage.message.mark === GLOBETEST_METRICS
    ) {
      storedMetrics = true
    }

    if (terminationMessage && storedGlobeTestLogs && storedMetrics) {
      orchestratorReadRedis.set(jobLogsKey, terminationMessage)
      orchestratorReadRedis.publish(jobUpdatesKey, terminationMessage)
    }
  })

  socket.on('disconnect', async () => {
    coreCacheReadRedis.hDel(runningTestKey, executionParams.id)
    orchestratorSubscribeRedis.unsubscribe(jobUpdatesKey)
    orchestratorReadRedis.del(jobLogsKey)

    const testState = runningTestStates.get(socket)

    if (!testState) {
      console.warn('Test state not found')
      return
    }

    // Delete the response if the test was abruptly stopped
    if (!testState.localCompleted) {
      if (testState.testType === 'rest' && testState.responseId) {
        await restDeleteResponse({
          params: params as WrappedExecutionParams,
          socket,
          responseId: testState.responseId,
          executionAgent: 'Local',
        })
      }
    }

    // Allow some time for final processing
    setTimeout(() => {
      socket.disconnect()
      eeSocket.disconnect()
      runningTestStates.delete(socket)
    }, 10000)

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

const correctCloudID = (msg: GlobeTestMessage, jobId: string): string =>
  JSON.stringify({
    ...msg,
    // Override jobId to be that specified in cloud, not the localhost agent
    jobId,
  })
