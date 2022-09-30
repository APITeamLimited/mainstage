import { GlobeTestMessage } from '@apiteam/types'
import { makeVar } from '@apollo/client'
import { io } from 'socket.io-client'
import * as Y from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { FocusedElementDictionary } from 'src/contexts/reactives'

import {
  BaseJob,
  ExecutingJob,
  PostExecutionJob,
  jobQueueVar,
  PendingLocalJob,
  QueuedJob,
  updateFilterQueue,
} from './lib'
import {
  addOptionsToRESTJob,
  ensureRESTResponseExists,
  postProcessRESTRequest,
} from './processors'

const getUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    const host = process.env['GLOBE_TEST_HOST']
    const port = process.env['GLOBE_TEST_PORT']

    if (!(host && port)) {
      throw new Error(
        `GLOBE_TEST_HOST and GLOBE_TEST_PORT must be set, got ${host} and ${port}`
      )
    }

    return `http://${host}:${port}`
  } else {
    // Get current domain
    const domain = window.location.hostname
    return `https://${domain}`
  }
}

type ExecuteArgs = {
  queueRef: React.MutableRefObject<QueuedJob[] | null>
  job: BaseJob & PendingLocalJob
  rawBearer: string
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
}

export const isExecutingRESTRequestVar = makeVar(false)

/*
Executes a queued job and updates the job queue on streamed messages
*/
export const execute = ({
  queueRef,
  job,
  rawBearer,
  workspace,
  focusedResponseDict,
}: ExecuteArgs): boolean => {
  try {
    const socket = io(getUrl(), {
      query: {
        scopeId: job.scopeId,
        bearer: rawBearer,
        sourceName: job.sourceName,
        source: job.source,
        environmentContext: JSON.stringify(job.environmentContext),
        endpoint: '/new-test',
      },
      path: '/api/globe-test',
      reconnection: false,
    })

    isExecutingRESTRequestVar(true)

    socket.on('updates', (message) => {
      const parsedMessage = parseMessage(message)
      addMessageToJob({
        job,
        workspace,
        focusedResponseDict,
        queueRef,
        parsedMessage,
        rawBearer,
      })

      if (parsedMessage.messageType === 'STATUS') {
        if (
          parsedMessage.message === 'COMPLETED_SUCCESS' ||
          parsedMessage.message === 'COMPLETED_FAILED'
        ) {
          socket.disconnect()
        }
      }
    })
  } catch (error) {
    isExecutingRESTRequestVar(false)
    snackErrorMessageVar(
      "Couldn't execute request, an unexpected error occurred"
    )
    return false
  }

  return true
}

const addMessageToJob = async ({
  job,
  workspace,
  focusedResponseDict,
  queueRef,
  parsedMessage,
  rawBearer,
}: {
  job: BaseJob & (PendingLocalJob | ExecutingJob | PostExecutionJob)
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
  queueRef: React.MutableRefObject<QueuedJob[] | null>
  parsedMessage: GlobeTestMessage
  rawBearer: string
}) => {
  const newJob = job as BaseJob & (ExecutingJob | PostExecutionJob)
  newJob.messages.push(parsedMessage)

  let queueNew = queueRef.current ?? []

  // If jobId not set, set it
  if (!newJob.jobId) {
    newJob.jobId = parsedMessage.jobId
    newJob.__subtype = 'ExecutingJob'

    queueNew = ensureRESTResponseExists({
      job: newJob,
      workspace,
      focusedResponseDict,
      currentQueue: queueRef.current ?? [],
    })
  }

  if (parsedMessage.messageType === 'STATUS') {
    newJob.jobStatus = parsedMessage.message
    queueNew = updateFilterQueue(queueNew, [newJob])

    if (
      newJob.jobStatus === 'COMPLETED_SUCCESS' ||
      newJob.jobStatus === 'COMPLETED_FAILED'
    ) {
      if (newJob.jobStatus === 'COMPLETED_FAILED') {
        // Look for the last ERROR message
        const errorMessages = newJob.messages.filter(
          (message) => message.messageType === 'ERROR'
        )

        const error =
          errorMessages.length > 0
            ? errorMessages[errorMessages.length - 1].message.toString()
            : 'An unknown error occured during execution'

        snackErrorMessageVar(error)
      }

      isExecutingRESTRequestVar(false)

      if (!workspace) throw new Error('No workspace')

      queueNew = await postProcessRESTRequest({
        currentQueue: queueNew,
        job: newJob,
        rawBearer,
        workspace,
        scopeId: newJob.scopeId,
        focusedResponseDict,
      })
    }
  }

  if (parsedMessage.messageType === 'OPTIONS') {
    queueNew = addOptionsToRESTJob({
      job: newJob,
      workspace,
      focusedResponseDict,
      currentQueue: queueNew,
      options: parsedMessage.message,
    })
  }

  jobQueueVar(queueNew)
}

/*
Parses some json so output in correct type
*/
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
