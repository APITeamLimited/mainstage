import { io } from 'socket.io-client'
import { AcceptibleMessages } from 'types/src'

import {
  BaseJob,
  ExecutingJob,
  PendingJob,
  QueuedJob,
  updateFilterQueue,
} from './lib'

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
    // TODO: Correctly implement env variables
    const gatewayUrl = 'https://apiteam-6pq1lw9jtzb.enterchange.io'

    if (!gatewayUrl) {
      throw new Error('GATEWAY_URL must be set')
    }

    return gatewayUrl
  }
}

type ExecuteArgs = {
  queueRef: React.MutableRefObject<QueuedJob[] | null>
  job: BaseJob & PendingJob
  rawBearer: string
}

/*
Executes a queued job and updates the job queue on streamed messages
*/
export const execute = ({ queueRef, job, rawBearer }: ExecuteArgs): boolean => {
  try {
    const socket = io(getUrl(), {
      query: {
        scopeId: job.scopeId,
        bearer: rawBearer,
        sourceName: job.sourceName,
        source: job.source,
        endpoint: '/new-test',
      },
      path:
        process.env.NODE_ENV === 'development'
          ? '/socket-io'
          : '/api/globe-test',
      reconnection: false,
    })

    socket.on('updates', (message: AcceptibleMessages) => {
      addMessageToJob(queueRef, job, message)
      console.log(
        new Date(),
        'updates',
        message.messageType === 'CONSOLE' || message.messageType === 'RESULTS'
          ? { ...message, message: JSON.parse(message.message) }
          : message
      )

      if (message.messageType === 'STATUS') {
        if (message.message === 'ERROR' || message.message === 'SUCCESS') {
          setTimeout(() => {
            socket.disconnect()
          }, 1000)
        }
      }
    })
  } catch (error) {
    console.log('error', error)
    return false
  }
  return true
}

const addMessageToJob = (
  queueRef: React.MutableRefObject<QueuedJob[] | null>,
  job: QueuedJob,
  message: AcceptibleMessages
) => {
  const newJob = { ...job } as BaseJob & ExecutingJob
  newJob.messages = [...job.messages, message]

  // If orchestrator message and job not set executing, get job id from it
  // Worker messages have different jobIds as they are sub-jobs
  if (Object(message).orchestratorId && !newJob.id) {
    newJob.jobStatus = 'executing'
    newJob.id = message.jobId
  }

  updateFilterQueue(queueRef.current || [], [newJob])
}
