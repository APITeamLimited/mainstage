import { GlobeTestMessage } from '@apiteam/types'
import { io } from 'socket.io-client'

import { checkValue } from 'src/config'

import {
  BaseJob,
  ExecutingJob,
  PostExecutionJob,
  jobQueueVar,
  PendingLocalJob,
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
    // Get current domain
    const domain = window.location.hostname
    return `https://${domain}`
  }
}

type ExecuteArgs = {
  queueRef: React.MutableRefObject<QueuedJob[] | null>
  job: BaseJob & PendingLocalJob
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
      path: '/api/globe-test',
      reconnection: false,
    })

    socket.on('updates', (message) => {
      const parsedMessage = parseMessage(message)
      console.log(parsedMessage)
      addMessageToJob(queueRef, job, parsedMessage)

      if (parsedMessage.messageType === 'STATUS') {
        if (
          parsedMessage.message === 'FAILED' ||
          parsedMessage.message === 'SUCCESS'
        ) {
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
  parsedMessage: GlobeTestMessage
) => {
  const newJob = job as BaseJob & (ExecutingJob | PostExecutionJob)
  newJob.messages.push(parsedMessage)

  // If jobId not set, set it
  if (!newJob.jobId) {
    newJob.jobId = parsedMessage.jobId
  }

  if (parsedMessage.messageType === 'STATUS') {
    newJob.jobStatus = parsedMessage.message
  }

  jobQueueVar(updateFilterQueue(queueRef.current || [], [newJob]))
}

/*
Parses some json so output in correct type
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseMessage = (message: any) => {
  const parsedMessage = message as GlobeTestMessage

  if (message.messageType === 'METRICS' || message.messageType === 'TAG') {
    parsedMessage.message = JSON.parse(message.message)
  }

  return parsedMessage
}
