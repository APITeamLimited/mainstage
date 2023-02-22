import {
  WrappedExecutionParams,
  GlobeTestOptions,
  AuthenticatedSocket,
} from '@apiteam/types'
import { Response as K6Response } from 'k6/http'

import { RunningTestState } from './test-states'
import {
  restHandleFailure,
  restHandleSuccessMultiple,
  restHandleSuccessSingle,
  folderHandleFailure,
  collectionHandleFailure,
  folderHandleSuccess,
  collectionHandleSuccess,
} from './variant-handlers'

export const handleResult = async ({
  wasSuccessful,
  runningState,
  socket,
  params,
  executionAgent,
  abortedEarly,
}: {
  wasSuccessful: boolean
  runningState: RunningTestState
  socket: AuthenticatedSocket
  params: WrappedExecutionParams
  executionAgent: 'Local' | 'Cloud'
  abortedEarly: boolean
}) => {
  const executionMode = runningState?.options?.executionMode as
    | GlobeTestOptions['executionMode']
    | undefined

  // This has already been asserted
  const testInfoStoreReceipt = runningState.testInfoStoreReceipt as string

  if (!wasSuccessful || !executionMode) {
    if (runningState.testType === 'RESTRequest') {
      await restHandleFailure({
        socket,
        params,
        testInfoStoreReceipt,
        executionAgent,
      })
    } else if (runningState.testType === 'Folder') {
      await folderHandleFailure({
        socket,
        params,
        testInfoStoreReceipt,
        executionAgent,
      })
    } else if (runningState.testType === 'Collection') {
      await collectionHandleFailure({
        socket,
        params,
        testInfoStoreReceipt,
        executionAgent,
      })
    }

    return
  }

  if (
    executionMode === 'httpSingle' &&
    runningState.testType === 'RESTRequest'
  ) {
    await restHandleSuccessSingle({
      params,
      socket,
      testInfoStoreReceipt: runningState.testInfoStoreReceipt as string,
      responseId: runningState.responseId as string,
      response: runningState.markedResponse as K6Response,
      executionAgent,
    })
  } else if (
    executionMode === 'httpMultiple' &&
    runningState.testType === 'RESTRequest'
  ) {
    await restHandleSuccessMultiple({
      params,
      socket,
      testInfoStoreReceipt: runningState.testInfoStoreReceipt as string,
      executionAgent,
      abortedEarly,
    })
  } else if (runningState.testType === 'Folder') {
    await folderHandleSuccess({
      params,
      socket,
      testInfoStoreReceipt: runningState.testInfoStoreReceipt as string,
      executionAgent,
      abortedEarly,
    })
  } else if (runningState.testType === 'Collection') {
    await collectionHandleSuccess({
      params,
      socket,
      testInfoStoreReceipt: runningState.testInfoStoreReceipt as string,
      executionAgent,
      abortedEarly,
    })
  } else {
    throw new Error(`Invalid test type: ${runningState.testType}`)
  }
}
