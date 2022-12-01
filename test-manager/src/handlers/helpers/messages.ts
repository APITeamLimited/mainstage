import {
  WrappedExecutionParams,
  GlobeTestMessage,
  GlobeTestOptions,
  AuthenticatedSocket,
} from '@apiteam/types'
import { Response as K6Response } from 'k6/http'

import { getCoreCacheReadRedis, getCoreCacheSubscribeRedis } from '../../redis'
import {
  restAddOptions,
  restHandleFailure,
  restHandleSuccessMultiple,
  restHandleSuccessSingle,
  updateTestInfo,
  runningTestStates,
  RunningTestState,
  ensureRESTResponseExists,
} from '../helpers'

// Trigger custom actions in response to certain messages
export const handleMessage = async (
  message: GlobeTestMessage,
  socket: AuthenticatedSocket,
  params: WrappedExecutionParams,
  jobId: string,
  runningTestKey: string,
  executionAgent: 'Local' | 'Cloud'
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()
  const coreCacheSubscribeRedis = await getCoreCacheSubscribeRedis()

  if (params.testType === 'rest') {
    await ensureRESTResponseExists(socket, params, jobId, executionAgent)

    if (message.messageType === 'OPTIONS') {
      await restAddOptions({
        socket,
        params,
        options: message.message,
        executionAgent,
      })
    }

    if (message.messageType === 'MARK') {
      if (message.message.mark === 'MarkedResponse') {
        const testState = runningTestStates.get(socket)
        if (!testState) throw new Error('Test state not found')

        if (testState.testType === 'rest' && !testState.markedResponse) {
          runningTestStates.set(socket, {
            ...(runningTestStates.get(socket) as RunningTestState),
            testType: 'rest',
            markedResponse: message.message.message as unknown as K6Response,
          })
        }
      }

      if (message.message.mark === 'GlobeTestLogsStoreReceipt') {
        runningTestStates.set(socket, {
          ...(runningTestStates.get(socket) as RunningTestState),
          globeTestLogsStoreReceipt: message.message.message as string,
        })
      }

      if (message.message.mark === 'MetricsStoreReceipt') {
        runningTestStates.set(socket, {
          ...(runningTestStates.get(socket) as RunningTestState),
          metricsStoreReceipt: message.message.message as string,
        })
      }
    }

    if (message.messageType === 'STATUS') {
      updateTestInfo(jobId, message.message, runningTestKey)

      // Cleaup running test state if the is finished
      if (message.message === 'SUCCESS' || message.message === 'FAILURE') {
        coreCacheReadRedis.hDel(runningTestKey, jobId)

        coreCacheSubscribeRedis.unsubscribe(
          `jobUserUpdates:${socket.scope.variant}:${socket.scope.variantTargetId}:${jobId}`
        )

        setTimeout(() => {
          runningTestStates.delete(socket)
          socket.disconnect()
        }, 10000)
      }

      if (
        message.message === 'COMPLETED_SUCCESS' ||
        message.message === 'COMPLETED_FAILURE'
      ) {
        const runningState = runningTestStates.get(socket) as RunningTestState

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
            await restHandleSuccessSingle({
              params,
              socket,
              globeTestLogsStoreReceipt:
                runningState.globeTestLogsStoreReceipt as string,
              metricsStoreReceipt: runningState.metricsStoreReceipt as string,
              responseId: runningState.responseId as string,
              response: runningState.markedResponse as K6Response,
              executionAgent,
            })

            await coreCacheReadRedis.hDel(runningTestKey, jobId)
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
              executionAgent,
            })

            await coreCacheReadRedis.hDel(runningTestKey, jobId)
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
            executionAgent,
          })

          await coreCacheReadRedis.hDel(runningTestKey, jobId)
        }

        // In case of linering client, force disconnect after 1 second
        setTimeout(() => {
          socket.disconnect()

          coreCacheReadRedis.hDel(runningTestKey, jobId)
        }, 5000)
      }
    }
  }
}
