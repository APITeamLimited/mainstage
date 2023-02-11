import {
  WrappedExecutionParams,
  GlobeTestMessage,
  AuthenticatedSocket,
  GLOBETEST_LOGS_MARK,
  METRICS_MARK,
} from '@apiteam/types'
import { Response as K6Response } from 'k6/http'

import { getCoreCacheReadRedis, getCoreCacheSubscribeRedis } from '../lib/redis'

import { handleResult } from './handle-result'
import { restAddOptions, restEnsureResponseExists } from './variant-handlers'

import { updateTestInfoCoreCache, runningTestStates, RunningTestState } from '.'

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

  if (
    params.testData.rootNode.variant === 'httpRequest' &&
    params.testData.rootNode.subVariant === 'RESTRequest'
  ) {
    await restEnsureResponseExists(
      socket,
      params,
      params.testData.rootNode,
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
    } else if (message.messageType === 'MARK') {
      if (message.message.mark === 'MarkedResponse') {
        // Bad hack for race conditions on slow clients

        const waitForOptions = async (initial: boolean, count = 0) => {
          if (!initial) {
            await new Promise((resolve) => setTimeout(resolve, 50))
          }

          const testState = runningTestStates.get(socket)
          if (!testState) throw new Error('Test state not found')

          if (
            testState.testType === 'RESTRequest' &&
            !testState.markedResponse
          ) {
            runningTestStates.set(socket, {
              ...(runningTestStates.get(socket) as RunningTestState),
              testType: 'RESTRequest',
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
        updateTestInfoCoreCache(jobId, message.message, runningTestKey)
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
        } else {
          const ensureAllData = async (count = 0): Promise<boolean> => {
            // Keep updating the running state
            runningState = runningTestStates.get(socket)

            if (!runningState || runningState.testType !== 'RESTRequest') {
              return false
            }

            let gotAllData =
              !!runningState.globeTestLogsStoreReceipt &&
              !!runningState.options &&
              !!runningState.responseId &&
              !!runningState.entityEngineSocket

            if (
              runningState.options?.executionMode === 'httpSingle' &&
              !runningState.markedResponse
            ) {
              gotAllData = false
            }

            if (
              runningState.options?.executionMode === 'httpMultiple' &&
              !runningState.metricsStoreReceipt
            ) {
              gotAllData = false
            }

            console.log('gotAllData', gotAllData)

            if (!gotAllData) {
              // If failure message dont bother waiting
              if (message.message === 'COMPLETED_FAILURE') {
                if (
                  !!runningState.globeTestLogsStoreReceipt &&
                  !!runningState.metricsStoreReceipt &&
                  !!runningState.entityEngineSocket
                ) {
                  return false
                }
              }

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
          abortedEarly: message.message === 'COMPLETED_FAILURE',
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
