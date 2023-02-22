import { AuthenticatedSocket, GlobeTestMessage } from '@apiteam/types'

import { RunningTestState, runningTestStates } from './test-states'

export const ensureAllData = async (
  message: GlobeTestMessage & {
    messageType: 'STATUS'
  },
  socket: AuthenticatedSocket
): Promise<{
  newTestState: RunningTestState | null
  successful: boolean
}> => {
  const runningState = runningTestStates.get(socket)

  if (!runningState || runningState.testType === 'undetermined') {
    return {
      newTestState: null,
      successful: false,
    }
  }

  if (runningState.testType === 'RESTRequest') {
    return restEnsureAllData(runningState, message, socket)
  }
  return groupEnsureAllData(runningState, message, socket)
}

const restEnsureAllData = async (
  runningState: RunningTestState & {
    testType: 'RESTRequest'
  },
  message: GlobeTestMessage & {
    messageType: 'STATUS'
  },
  socket: AuthenticatedSocket,
  count = 0
): Promise<{
  newTestState: RunningTestState
  successful: boolean
}> => {
  runningState = runningTestStates.get(socket) as RunningTestState & {
    testType: 'RESTRequest'
  }

  let gotAllData =
    !!runningState.testInfoStoreReceipt &&
    !!runningState.options &&
    !!runningState.responseId &&
    !!runningState.entityEngineSocket

  if (
    runningState.options?.executionMode === 'httpSingle' &&
    !runningState.markedResponse
  ) {
    gotAllData = false
  }

  console.log('gotAllData', gotAllData)

  if (!gotAllData) {
    // If failure message dont bother waiting
    if (message.message === 'COMPLETED_FAILURE') {
      if (
        !!runningState.testInfoStoreReceipt &&
        !!runningState.entityEngineSocket
      ) {
        return {
          newTestState: runningState,
          successful: false,
        }
      }
    }

    if (count < 15) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return await restEnsureAllData(runningState, message, socket, count + 1)
    }
  }

  return {
    newTestState: runningState,
    successful: gotAllData,
  }
}

const groupEnsureAllData = async (
  runningState: RunningTestState & {
    testType: 'Folder' | 'Collection'
  },
  message: GlobeTestMessage & {
    messageType: 'STATUS'
  },
  socket: AuthenticatedSocket,
  count = 0
): Promise<{
  newTestState: RunningTestState
  successful: boolean
}> => {
  runningState = runningTestStates.get(socket) as RunningTestState & {
    testType: 'Folder'
  }

  const gotAllData =
    !!runningState.testInfoStoreReceipt &&
    !!runningState.options &&
    !!runningState.responseId &&
    !!runningState.entityEngineSocket

  if (!gotAllData) {
    // If failure message dont bother waiting
    if (message.message === 'COMPLETED_FAILURE') {
      if (
        !!runningState.testInfoStoreReceipt &&
        !!runningState.entityEngineSocket
      ) {
        return {
          newTestState: runningState,
          successful: false,
        }
      }
    }

    if (count < 15) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return await groupEnsureAllData(runningState, message, socket, count + 1)
    }
  }

  return {
    newTestState: runningState,
    successful: gotAllData,
  }
}
