import {
  WrappedExecutionParams,
  GlobeTestMessage,
  GlobeTestOptions,
  AuthenticatedSocket,
  GLOBETEST_LOGS_MARK,
  METRICS_MARK,
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
  executionAgent: 'Local' | 'Cloud',
  localJobId?: string
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()
  const coreCacheSubscribeRedis = await getCoreCacheSubscribeRedis()

  if (params.testType === 'rest') {
    await ensureRESTResponseExists(
      socket,
      params,
      jobId,
      executionAgent,
      localJobId
    )

    if (message.messageType === 'OPTIONS') {
      await restAddOptions({
        socket,
        params,
        options: message.message,
        executionAgent,
      })
    }

    // } else if (message.messageType === 'JOB_INFO' && message.message.options) {
    //   await restAddOptions({
    //     socket,
    //     params,
    //     options: message.message.options,
    //     executionAgent,
    //   })
    // }
    else if (message.messageType === 'MARK') {
      if (message.message.mark === 'MarkedResponse') {
        // Bad hack for race conditions on slow clients

        const waitForOptions = async (initial: boolean, count = 0) => {
          if (!initial) {
            await new Promise((resolve) => setTimeout(resolve, 50))
          }

          const testState = runningTestStates.get(socket)
          if (!testState) throw new Error('Test state not found')

          if (testState.testType === 'rest' && !testState.markedResponse) {
            runningTestStates.set(socket, {
              ...(runningTestStates.get(socket) as RunningTestState),
              testType: 'rest',
              markedResponse: message.message.message as K6Response,
            })
          } else if (testState.testType === 'undetermined') {
            if (count < 20) {
              waitForOptions(false, count + 1)
            }
          }
        }

        waitForOptions(true)
      }

      if (message.message.mark === GLOBETEST_LOGS_MARK) {
        runningTestStates.set(socket, {
          ...(runningTestStates.get(socket) as RunningTestState),
          globeTestLogsStoreReceipt: message.message.message as string,
        })
      }

      if (message.message.mark === METRICS_MARK) {
        runningTestStates.set(socket, {
          ...(runningTestStates.get(socket) as RunningTestState),
          metricsStoreReceipt: message.message.message as string,
        })
      }
    }

    if (message.messageType === 'STATUS') {
      if (
        message.message !== 'COMPLETED_SUCCESS' &&
        message.message !== 'COMPLETED_FAILURE'
      ) {
        updateTestInfo(jobId, message.message, runningTestKey)
      } else {
        console.log('Delete 6')
        coreCacheReadRedis.hDel(runningTestKey, jobId)

        if (executionAgent === 'Cloud') {
          coreCacheSubscribeRedis.unsubscribe(
            `jobUserUpdates:${socket.scope.variant}:${socket.scope.variantTargetId}:${jobId}`
          )
        }

        let runningState = runningTestStates.get(socket)

        if (!runningState)
          throw new Error(`Running state not found, ${JSON.stringify(message)}`)

        let wasSuccessful = true

        if (runningState.testType === 'undetermined') {
          wasSuccessful = false
        } else if (message.message === 'COMPLETED_FAILURE') {
          wasSuccessful = false
        } else if (message.message === 'COMPLETED_SUCCESS') {
          const ensureAllData = async (count = 0): Promise<boolean> => {
            // Keep updating the running state
            runningState = runningTestStates.get(socket)

            if (!runningState || runningState.testType !== 'rest') {
              return false
            }

            const gotAllData =
              !!runningState.globeTestLogsStoreReceipt &&
              !!runningState.metricsStoreReceipt &&
              !!runningState.options &&
              !!runningState.responseId &&
              !!runningState.entityEngineSocket &&
              !!runningState.markedResponse

            console.log('gotAllData', gotAllData)

            if (!gotAllData) {
              if (count < 15) {
                await new Promise((resolve) => setTimeout(resolve, 500))
                return await ensureAllData(count + 1)
              }
            }

            return gotAllData
          }

          wasSuccessful = await ensureAllData(0)
        }

        await handleResult({
          wasSuccessful,
          runningState,
          socket,
          params,
          executionAgent,
          runningTestKey,
          jobId,
        })

        if (!wasSuccessful) {
          //FInd why not
          console.log(
            'FAILED',
            runningState.testType === 'undetermined',
            message.message === 'COMPLETED_FAILURE',
            !runningState.globeTestLogsStoreReceipt,
            !runningState.metricsStoreReceipt,
            !runningState.options,
            // @ts-ignore
            !runningState.responseId,
            !runningState.entityEngineSocket,
            // @ts-ignore
            !runningState.markedResponse
          )
        }

        console.log('delete 3')
        await coreCacheReadRedis.hDel(runningTestKey, jobId)

        // In case of linering client, force disconnect after 1 second
        setTimeout(() => {
          socket.disconnect()

          console.log('Delete 2')
          coreCacheReadRedis.hDel(runningTestKey, jobId)
        }, 5000)
      }
    }
  }
}

const handleResult = async ({
  wasSuccessful,
  runningState,
  socket,
  params,
  executionAgent,
  runningTestKey,
  jobId,
}: {
  wasSuccessful: boolean
  runningState: RunningTestState
  socket: AuthenticatedSocket
  params: WrappedExecutionParams
  executionAgent: 'Local' | 'Cloud'
  runningTestKey: string
  jobId: string
}) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  if (!wasSuccessful) {
    await restHandleFailure({
      socket,
      params,
      globeTestLogsStoreReceipt: runningState.globeTestLogsStoreReceipt ?? null,
      metricsStoreReceipt: runningState.metricsStoreReceipt ?? null,
      executionAgent,
    })

    return
  }

  if (
    (runningState.options as GlobeTestOptions).executionMode === 'httpSingle' &&
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

    console.log('Delete 5')
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

    console.log('Delete 4')
    await coreCacheReadRedis.hDel(runningTestKey, jobId)
  } else {
    throw new Error(`Invalid test type: ${runningState.testType}`)
  }
}
