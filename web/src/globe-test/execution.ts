import { io } from 'socket.io-client'
import { AcceptibleMessages } from 'types/src'

import { checkValue } from 'src/config'

import {
  BaseJob,
  ExecutingJob,
  PendingJob,
  QueuedJob,
  updateFilterQueue,
} from './lib'

const globeTestHost = 'localhost' //checkValue<string>('globeTest.host')
const globeTestPort = '8966' //checkValue<number>('globeTest.port')

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
    const socket = io(`http://${globeTestHost}:${globeTestPort}/`, {
      query: {
        scopeId: job.scopeId,
        bearer: rawBearer,
        sourceName: job.sourceName,
        source: job.source,
        endpoint: '/new-test',
      },
      reconnection: false,
    })

    socket.on('test-message', (message: AcceptibleMessages) => {
      addMessageToJob(queueRef, job, message)
      console.log(new Date(), 'test-message', message)

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
