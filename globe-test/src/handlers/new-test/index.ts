import {
  WrappedExecutionParams,
  GlobeTestMessage,
  ExecutionParams,
  GlobeTestOptions,
  AuthenticatedSocket,
  RunningTestInfo,
  StatusType,
} from '@apiteam/types'
import type { Scope } from '@prisma/client'
import { Response } from 'k6/http'
import { parse } from 'query-string'
import { Socket } from 'socket.io'
import type { Socket as EntityEngineSocket } from 'socket.io-client'
import { v4 as uuid } from 'uuid'

import {
  coreCacheReadRedis,
  orchestratorReadRedis,
  orchestratorSubscribeRedis,
} from '../../redis'
import { validateParams } from '../../validator'

import {
  restAddOptions,
  restCreateResponse,
  restHandleFailure,
  restHandleSuccessMultiple,
  restHandleSuccessSingle,
} from './helpers'
import { getEntityEngineSocket, getVerifiedDomains } from './utils'

// Store state of running tests
export const runningTestStates = new Map<Socket, TestRunningState>()

export type TestRunningState =
  | {
      jobId?: string
      entityEngineSocket?: EntityEngineSocket
      globeTestLogsStoreReceipt?: string
      metricsStoreReceipt?: string
      options?: GlobeTestOptions
      responseExistence: 'none' | 'creating' | 'created'
    } & (
      | {
          testType: 'rest'
          markedResponse?: Response
          responseId?: string
        }
      | {
          testType: 'undetermined'
        }
    )

// Creates a new test and streams the result
export const handleNewTest = async (socket: AuthenticatedSocket) => {
  let params = null as WrappedExecutionParams | null

  try {
    params = validateParams(parse(socket.request.url?.split('?')[1] || ''))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e)
    // Close the socket if the params are invalid
    socket.emit('error', e.message)
    socket.disconnect()
    return
  }

  if (params === null) {
    socket.emit('error', 'Invalid params')
    socket.disconnect()
    return
  }

  runningTestStates.set(socket, {
    testType: 'undetermined',
    responseExistence: 'none',
  })

  // Calling this first here seems to prevent the race condition
  const [_, verifiedDomains] = await Promise.all([
    getEntityEngineSocket(
      socket,
      params.scopeId,
      params.bearer,
      params.projectId
    ),
    await getVerifiedDomains(
      socket.scope.variant,
      socket.scope.variantTargetId
    ),
  ])

  const executionParams = {
    id: uuid(),
    source: params.source,
    sourceName: params.sourceName,
    status: 'PENDING',
    environmentContext: params.environmentContext,
    collectionContext: params.collectionContext,
    finalRequest: params.finalRequest,
    underlyingRequest: params.underlyingRequest,
    scope: {
      variant: socket.scope.variant,
      variantTargetId: socket.scope.variantTargetId,
    },
    verifiedDomains,
  } as ExecutionParams

  // Start stream before scheduling to ensure all messages are received
  orchestratorSubscribeRedis.subscribe(
    `orchestrator:executionUpdates:${executionParams.id}`,
    (message) => {
      const messageObject = parseMessage(
        JSON.parse(message)
      ) as GlobeTestMessage
      socket.emit('updates', messageObject)
      handleMessage(
        messageObject,
        socket,
        params as WrappedExecutionParams,
        executionParams.id
      )
    }
  )

  const runningTestInfo: RunningTestInfo = {
    jobId: executionParams.id,
    sourceName: executionParams.sourceName,
    createdByUserId: socket.scope.userId,
    createdAt: new Date().toISOString(),
    status: 'ASSIGNED',
  }

  // Set job info first to prevent race condition
  await Promise.all([
    orchestratorReadRedis.hSet(
      executionParams.id,
      'job',
      JSON.stringify(executionParams)
    ),
    coreCacheReadRedis.hSet(
      `workspace:${socket.scope.variant}:${socket.scope.variantTargetId}`,
      runningTestInfo.jobId,
      JSON.stringify(runningTestInfo)
    ),
  ])

  // Broadcast the new job
  await Promise.all([
    orchestratorReadRedis.sAdd(
      'orchestrator:executionHistory',
      executionParams.id
    ),
    orchestratorReadRedis.publish('orchestrator:execution', executionParams.id),
  ])
}

// Trigger custom actions in response to certain messages
const handleMessage = async (
  message: GlobeTestMessage,
  socket: AuthenticatedSocket,
  params: WrappedExecutionParams,
  jobId: string
) => {
  if (params.testType === 'rest') {
    await ensureRESTResponseExists(socket, params, message.jobId)

    if (message.messageType === 'OPTIONS') {
      await restAddOptions({ socket, params, options: message.message })
    }

    if (message.messageType === 'MARK') {
      if (message.message.mark === 'MarkedResponse') {
        const testState = runningTestStates.get(socket)
        if (!testState) throw new Error('Test state not found')

        if (testState.testType === 'rest' && !testState.markedResponse) {
          runningTestStates.set(socket, {
            ...(runningTestStates.get(socket) as TestRunningState),
            testType: 'rest',
            markedResponse: message.message.message as unknown as Response,
          })
        }
      }

      if (message.message.mark === 'GlobeTestLogsStoreReceipt') {
        runningTestStates.set(socket, {
          ...(runningTestStates.get(socket) as TestRunningState),
          globeTestLogsStoreReceipt: message.message.message as string,
        })
      }

      if (message.message.mark === 'MetricsStoreReceipt') {
        runningTestStates.set(socket, {
          ...(runningTestStates.get(socket) as TestRunningState),
          metricsStoreReceipt: message.message.message as string,
        })
      }
    }

    if (message.messageType === 'STATUS') {
      updateTestInfo(socket.scope, jobId, message.message)

      if (
        message.message === 'COMPLETED_SUCCESS' ||
        message.message === 'COMPLETED_FAILURE'
      ) {
        const runningState = runningTestStates.get(socket) as TestRunningState

        let wasSuccessful = true

        if (runningState.testType === 'undetermined') {
          wasSuccessful = false
        } else if (message.message === 'COMPLETED_FAILURE') {
          wasSuccessful = false
        } else if (message.message === 'COMPLETED_SUCCESS') {
          if (
            !runningState.globeTestLogsStoreReceipt ||
            !runningState.metricsStoreReceipt ||
            !runningState.options ||
            !runningState.responseId ||
            !runningState.entityEngineSocket
          ) {
            wasSuccessful = false
          }

          if (
            (runningState.options as GlobeTestOptions).executionMode ===
              'httpSingle' &&
            !runningState.markedResponse
          ) {
            wasSuccessful = false
          }
        }

        if (wasSuccessful) {
          if (
            (runningState.options as GlobeTestOptions).executionMode ===
              'httpSingle' &&
            runningState.testType === 'rest'
          ) {
            await Promise.all([
              restHandleSuccessSingle({
                params,
                socket,
                globeTestLogsStoreReceipt:
                  runningState.globeTestLogsStoreReceipt as string,
                metricsStoreReceipt: runningState.metricsStoreReceipt as string,
                responseId: runningState.responseId as string,
                response: runningState.markedResponse as Response,
              }),
              coreCacheReadRedis.hDel(
                `workspace:${socket.scope.variant}:${socket.scope.variantTargetId}`,
                jobId
              ),
            ])
          } else if (
            (runningState.options as GlobeTestOptions).executionMode ===
              'httpMultiple' &&
            runningState.testType === 'rest'
          ) {
            await restHandleSuccessMultiple({
              params,
              socket,
              globeTestLogsStoreReceipt:
                runningState.globeTestLogsStoreReceipt as string,
              metricsStoreReceipt: runningState.metricsStoreReceipt as string,
            })
          } else {
            throw new Error(`Invalid test type: ${runningState.testType}`)
          }
        } else {
          await restHandleFailure({
            socket,
            params,
            globeTestLogsStoreReceipt:
              runningState.globeTestLogsStoreReceipt ?? null,
            metricsStoreReceipt: runningState.metricsStoreReceipt ?? null,
          })
        }

        // In case of linering client, force disconnect after 1 second
        setTimeout(() => {
          socket.disconnect()
        }, 5000)
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseMessage = (message: any) => {
  if (
    message.messageType === 'SUMMARY_METRICS' ||
    message.messageType === 'METRICS' ||
    message.messageType === 'MARK' ||
    message.messageType === 'JOB_INFO' ||
    message.messageType === 'CONSOLE' ||
    message.messageType === 'OPTIONS'
  ) {
    message.message = JSON.parse(message.message)
    message.time = new Date(message.time)
  }

  return message as GlobeTestMessage
}

const ensureRESTResponseExists = async (
  socket: Socket,
  params: WrappedExecutionParams,
  jobId: string
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
      ...(runningTestStates.get(socket) as TestRunningState),
      responseExistence: 'creating',
    })

    return await restCreateResponse({ socket, params, jobId })
  }
}

const updateTestInfo = async (
  scope: Scope,
  jobId: string,
  status: StatusType
) => {
  const testInfo = await coreCacheReadRedis.hGet(
    `workspace:${scope.variant}:${scope.variantTargetId}`,
    jobId
  )

  if (!testInfo) {
    throw new Error('Test info not found')
  }

  const parsedTestInfo = JSON.parse(testInfo) as RunningTestInfo

  await coreCacheReadRedis.hSet(
    `workspace:${scope.variant}:${scope.variantTargetId}`,
    jobId,
    JSON.stringify({
      ...parsedTestInfo,
      status,
    })
  )
}
