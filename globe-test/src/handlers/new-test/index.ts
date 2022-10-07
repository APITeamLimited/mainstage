import {
  WrappedExecutionParams,
  GlobeTestMessage,
  ExecutionParams,
  GlobeTestOptions,
} from '@apiteam/types'
import { Response } from 'k6/http'
import { parse } from 'query-string'
import { Socket } from 'socket.io'
import type { Socket as EntityEngineSocket } from 'socket.io-client'
import { v4 as uuid } from 'uuid'

import { orchestratorReadRedis, orchestratorSubscribeRedis } from '../../redis'
import { validateParams } from '../../validator'

import {
  restAddOptions,
  restCreateResponse,
  restHandleFailure,
  restHandleSuccessSingle,
} from './helpers'
import { getEntityEngineSocket } from './utils'
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
export const handleNewTest = async (socket: Socket) => {
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
  await getEntityEngineSocket(
    socket,
    params.scopeId,
    params.bearer,
    params.projectId
  )

  const executionParams = {
    id: uuid(),
    source: params.source,
    sourceName: params.sourceName,
    scopeId: params.scopeId,
    status: 'PENDING',
    environmentContext: params.environmentContext,
    collectionContext: params.collectionContext,
    restRequest: params.restRequest,
  } as ExecutionParams

  // Start stream before scheduling to ensure all messages are received
  orchestratorSubscribeRedis.subscribe(
    `orchestrator:executionUpdates:${executionParams.id}`,
    (message) => {
      const messageObject = parseMessage(
        JSON.parse(message)
      ) as GlobeTestMessage
      socket.emit('updates', messageObject)
      handleMessage(messageObject, socket, params as WrappedExecutionParams)
    }
  )

  await orchestratorReadRedis.hSet(
    executionParams.id,
    'job',
    JSON.stringify(executionParams)
  )

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
  socket: Socket,
  params: WrappedExecutionParams
) => {
  if (params.testType === 'rest') {
    await ensureRESTResponseExists(socket, params, message.jobId)

    if (message.messageType === 'OPTIONS') {
      await restAddOptions({ socket, params, options: message.message })
    }

    if (message.messageType === 'MARK') {
      if (message.message.mark === 'RESTResult') {
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
      if (
        message.message === 'COMPLETED_SUCCESS' ||
        message.message === 'COMPLETED_FAILED'
      ) {
        const runningState = runningTestStates.get(socket) as TestRunningState

        let wasSuccessful = true

        if (runningState.testType === 'undetermined') {
          wasSuccessful = false
        } else if (message.message === 'COMPLETED_FAILED') {
          wasSuccessful = false
        } else if (message.message === 'COMPLETED_SUCCESS') {
          if (
            !runningState.globeTestLogsStoreReceipt ||
            !runningState.metricsStoreReceipt ||
            !runningState.options ||
            !runningState.markedResponse ||
            !runningState.responseId ||
            !runningState.entityEngineSocket
          ) {
            wasSuccessful = false
          }
        }

        if (wasSuccessful) {
          if (
            (runningState.options as GlobeTestOptions).executionMode ===
              'rest_single' &&
            runningState.testType === 'rest'
          ) {
            await restHandleSuccessSingle({
              params,
              socket,
              globeTestLogsStoreReceipt:
                runningState.globeTestLogsStoreReceipt as string,
              metricsStoreReceipt: runningState.metricsStoreReceipt as string,
              responseId: runningState.responseId as string,
              response: runningState.markedResponse as Response,
            })
          }
        } else {
          await restHandleFailure({
            socket,
            params,
            globeTestLogsStoreReceipt:
              runningState.globeTestLogsStoreReceipt ?? null,
          })
        }

        // In case of linering client, force disconnect after 1 second
        setTimeout(() => {
          socket.disconnect()
        }, 1000)
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

  if (message.workerId === '' && message.orchestratorId !== '') {
    delete message.workerId
  }

  if (message.orchestratorId === '' && message.workerId !== '') {
    delete message.orchestratorId
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
