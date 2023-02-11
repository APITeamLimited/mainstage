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
  if (!wasSuccessful) {
    if (runningState.testType === 'RESTRequest') {
      await restHandleFailure({
        socket,
        params,
        globeTestLogsStoreReceipt:
          runningState.globeTestLogsStoreReceipt ?? null,
        metricsStoreReceipt: runningState.metricsStoreReceipt ?? null,
        executionAgent,
      })
    } else if (runningState.testType === 'Folder') {
      await folderHandleFailure({
        socket,
        params,
        globeTestLogsStoreReceipt:
          runningState.globeTestLogsStoreReceipt ?? null,
        metricsStoreReceipt: runningState.metricsStoreReceipt ?? null,
        executionAgent,
      })
    } else if (runningState.testType === 'Collection') {
      await collectionHandleFailure({
        socket,
        params,
        globeTestLogsStoreReceipt:
          runningState.globeTestLogsStoreReceipt ?? null,
        metricsStoreReceipt: runningState.metricsStoreReceipt ?? null,
        executionAgent,
      })

      return
    }
  }

  const executionMode = (runningState.options as GlobeTestOptions).executionMode

  if (
    executionMode === 'httpSingle' &&
    runningState.testType === 'RESTRequest'
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
  } else if (
    (runningState.options as GlobeTestOptions).executionMode ===
      'httpMultiple' &&
    runningState.testType === 'RESTRequest'
  ) {
    await restHandleSuccessMultiple({
      params,
      socket,
      globeTestLogsStoreReceipt:
        runningState.globeTestLogsStoreReceipt as string,
      metricsStoreReceipt: runningState.metricsStoreReceipt as string,
      executionAgent,
      abortedEarly,
    })
  } else if (runningState.testType === 'Folder') {
    await folderHandleSuccess({
      params,
      socket,
      globeTestLogsStoreReceipt:
        runningState.globeTestLogsStoreReceipt as string,
      metricsStoreReceipt: runningState.metricsStoreReceipt as string,
      executionAgent,
      abortedEarly,
    })
  } else if (runningState.testType === 'Collection') {
    await collectionHandleSuccess({
      params,
      socket,
      globeTestLogsStoreReceipt:
        runningState.globeTestLogsStoreReceipt as string,
      metricsStoreReceipt: runningState.metricsStoreReceipt as string,
      executionAgent,
      abortedEarly,
    })
  } else {
    throw new Error(`Invalid test type: ${runningState.testType}`)
  }
}
