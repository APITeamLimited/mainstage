import {
  WrappedExecutionParams,
  GlobeTestMessage,
  AuthenticatedSocket,
  TEST_INFO_MARK,
} from '@apiteam/types'
import { Response as K6Response } from 'k6/http'

import { getCoreCacheReadRedis, getCoreCacheSubscribeRedis } from '../lib/redis'

import { ensureAllData } from './ensure-all-data'
import { handleResult } from './handle-result'
import {
  collectionEnsureResponseExists,
  folderEnsureResponseExists,
  restAddOptions,
  restEnsureResponseExists,
  folderAddOptions,
  collectionAddOptions,
} from './variant-handlers'

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
  } else if (
    params.testData.rootNode.variant === 'group' &&
    params.testData.rootNode.subVariant === 'Folder'
  ) {
    await folderEnsureResponseExists(
      socket,
      params,
      params.testData.rootNode,
      jobId,
      executionAgent,
      localJobId
    )
  } else if (
    params.testData.rootNode.variant === 'group' &&
    params.testData.rootNode.subVariant === 'Collection'
  ) {
    await collectionEnsureResponseExists(
      socket,
      params,
      params.testData.rootNode,
      jobId,
      executionAgent,
      localJobId
    )
  }

  if (message.messageType === 'OPTIONS') {
    if (
      params.testData.rootNode.variant === 'httpRequest' &&
      params.testData.rootNode.subVariant === 'RESTRequest'
    ) {
      await restAddOptions({
        socket,
        params,
        options: message.message,
        executionAgent,
      })
    } else if (
      params.testData.rootNode.variant === 'group' &&
      params.testData.rootNode.subVariant === 'Folder'
    ) {
      await folderAddOptions({
        socket,
        params,
        options: message.message,
        executionAgent,
      })
    } else if (
      params.testData.rootNode.variant === 'group' &&
      params.testData.rootNode.subVariant === 'Collection'
    ) {
      await collectionAddOptions({
        socket,
        params,
        options: message.message,
        executionAgent,
      })
    }
  }

  if (message.messageType === 'MARK') {
    if (
      params.testData.rootNode.variant === 'httpRequest' &&
      params.testData.rootNode.subVariant === 'RESTRequest'
    ) {
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
    }

    if (message.message.mark === TEST_INFO_MARK) {
      runningTestStates.set(socket, {
        ...(runningTestStates.get(socket) as RunningTestState),
        testInfoStoreReceipt: message.message.message as string,
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
        const { newTestState, successful } = await ensureAllData(
          message,
          socket
        )

        if (newTestState) {
          runningState = newTestState
        }

        wasSuccessful = successful
      }

      await handleResult({
        wasSuccessful,
        runningState,
        socket,
        params,
        executionAgent,
        abortedEarly: message.message === 'COMPLETED_FAILURE',
      })

      if (!wasSuccessful) {
        //FInd why not
        console.log(
          'FAILED',
          runningState.testType === 'undetermined',
          message.message === 'COMPLETED_FAILURE',
          !runningState.testInfoStoreReceipt,
          !runningState.options,

          // @ts-ignore
          !runningState.responseId,

          !runningState.entityEngineSocket,

          // @ts-ignore
          !runningState.markedResponse
        )
      }

      console.log('delete 3')

      // In case of linering client, force disconnect after 1 second
      setTimeout(() => {
        socket.disconnect()

        console.log('Delete 2')
        coreCacheReadRedis.hDel(runningTestKey, jobId)
      }, 5000)
    }
  }
}
