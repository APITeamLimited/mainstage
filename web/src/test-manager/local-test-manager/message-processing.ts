import {
  GlobeTestMessage,
  GLOBETEST_LOGS,
  GLOBETEST_LOGS_MARK,
  GLOBETEST_METRICS,
  LocalTestManagerServerMessage,
  METRICS_MARK,
  parseGlobeTestMessage,
  parseAndValidateGlobeTestMessage,
} from '@apiteam/types/src'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { uploadScopedResource } from 'src/store'

import {
  LocalTestManager,
  TerminationMessage,
  Upload,
} from './local-test-manager'

export const processGlobeTestMessage = async (
  agentMessage: LocalTestManagerServerMessage,
  manager: LocalTestManager
) => {
  const parseResult = parseAndValidateGlobeTestMessage(agentMessage.message)

  if (!parseResult.success) {
    snackErrorMessageVar(
      'Received an invalid message from the localhost test agent'
    )
    console.log(
      'Invalid message',
      parseResult.error,
      parseGlobeTestMessage(agentMessage.message)
    )
    return
  }

  const parsedMessage = parseResult.data

  const upload = manager.uploads.find(
    (upload) => upload.jobId === parsedMessage.jobId
  )

  if (!upload) {
    throw new Error('Could not find upload for already running job')
  }

  const isTerminationMessage =
    parsedMessage.messageType === 'STATUS' &&
    (parsedMessage.message === 'COMPLETED_SUCCESS' ||
      parsedMessage.message === 'COMPLETED_FAILURE')

  if (isTerminationMessage) {
    upload.terminationMessage = parsedMessage

    await checkBroadcastTermination(
      manager,
      upload,
      parsedMessage as TerminationMessage
    )
  }

  if (!isTerminationMessage && parsedMessage.messageType === 'STATUS') {
    manager.updateJobStatus(parsedMessage.jobId, parsedMessage.message)
  }

  if (parsedMessage.messageType === 'OPTIONS') {
    upload.storedOptions = true
  }

  if (
    parsedMessage.messageType === 'LOCALHOST_FILE' &&
    (parsedMessage.message.kind === GLOBETEST_LOGS ||
      parsedMessage.message.kind === GLOBETEST_METRICS)
  ) {
    if (!manager.scopeId || !manager.rawBearer) {
      throw new Error("No scope id or bearer token, can't upload")
    }

    upload.uploadCount += 1

    const storeReceipt = await uploadScopedResource({
      scopeId: manager.scopeId,
      rawBearer: manager.rawBearer,
      resource: new Blob([parsedMessage.message.contents]),
      resourceName: parsedMessage.message.fileName,
    })

    if (parsedMessage.message.kind === GLOBETEST_LOGS) {
      upload.storedGlobeTestLogs = true
    } else {
      upload.storedMetrics = true
    }

    const uploadMessage = {
      jobId: parsedMessage.jobId,
      time: parsedMessage.time,
      messageType: 'MARK',
      message: {
        mark:
          parsedMessage.message.kind === GLOBETEST_LOGS
            ? GLOBETEST_LOGS_MARK
            : parsedMessage.message.kind === GLOBETEST_METRICS
            ? METRICS_MARK
            : parsedMessage.message.kind,
        message: storeReceipt,
      },
      senderVariant: parsedMessage.senderVariant,
    } as GlobeTestMessage

    if (
      uploadMessage.senderVariant === 'Orchestrator' &&
      parsedMessage.senderVariant === 'Orchestrator'
    ) {
      uploadMessage.orchestratorId = parsedMessage.orchestratorId
    } else if (
      uploadMessage.senderVariant === 'Worker' &&
      parsedMessage.senderVariant === 'Worker'
    ) {
      uploadMessage.workerId = parsedMessage.workerId
    }

    addToUploadQueue(upload, uploadMessage)

    upload.uploadCount -= 1

    await checkBroadcastTermination(
      manager,
      upload,
      upload.terminationMessage as TerminationMessage
    )
  } else if (!isTerminationMessage) {
    addToUploadQueue(upload, parsedMessage)
  }
}

const checkBroadcastTermination = async (
  manager: LocalTestManager,
  upload: Upload,
  terminationMessage: TerminationMessage
) => {
  if (
    upload.storedGlobeTestLogs &&
    upload.storedMetrics &&
    upload.terminationMessage &&
    upload.storedOptions &&
    upload.uploadCount === 0
  ) {
    await new Promise((resolve) => setTimeout(resolve, 20))
    manager.updateJobStatus(
      terminationMessage.jobId,
      terminationMessage.message
    )
    addToUploadQueue(upload, terminationMessage)
  }
}

const addToUploadQueue = (upload: Upload, message: GlobeTestMessage) => {
  if (upload.socket && upload.socket.connected) {
    upload.socket.emit('globeTestMessage', message)
  } else {
    upload.queue.push(message)
  }
}
