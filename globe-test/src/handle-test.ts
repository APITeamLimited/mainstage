import { ExecutionParams } from '@apiteam/types'
import { parse } from 'query-string'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { orchestratorReadRedis, orchestratorSubscribeRedis } from './redis'
import { validateParams } from './validator'

type BaseMessage = {
  jobId: string
  scopeId: string
  time: number
  message: string
  messageType: 'STATUS' | 'ERROR' | 'MESSAGE'
}

type WorkerMessage = BaseMessage & {
  workerId: string
}

type OrchestratorMessage = BaseMessage & {
  orchestratorId: string
}

/*
Creates a new test and streams the result
*/
export const handleNewTest = async (socket: Socket) => {
  let params = null as ExecutionParams | null

  try {
    params = validateParams(parse(socket.request.url?.split('?')[1] || ''))
  } catch (e: any) {
    // Close the socket if the params are invalid
    socket.emit('error', e.message)
    socket.disconnect()
    return
  }

  const newJob = {
    id: uuid(),
    source: params.source,
    sourceName: params.sourceName,
    scopeId: params.scopeId,
    status: 'PENDING',
    environmentContext: JSON.stringify(params.environmentContext),
  }

  // Start stream before scheduling to ensure all messages are received
  orchestratorSubscribeRedis.subscribe(
    `orchestrator:executionUpdates:${newJob.id}`,
    (message) => {
      const messageObject = JSON.parse(message) as
        | WorkerMessage
        | OrchestratorMessage

      if (messageObject.messageType === 'STATUS') {
        if (
          messageObject.message === 'ERROR' ||
          messageObject.message === 'SUCCESS'
        ) {
          setTimeout(() => {
            socket.disconnect()
          }, 1000)
        }
      }

      socket.emit('updates', messageObject)
    }
  )

  await new Promise((resolve) => setTimeout(resolve, 100))

  await Promise.all(
    Object.entries(newJob).map(([key, value]) =>
      orchestratorReadRedis.hSet(newJob.id, key, value)
    )
  )

  // Broadcast the new job
  await orchestratorReadRedis.sAdd('orchestrator:executionHistory', newJob.id)
  await orchestratorReadRedis.publish('orchestrator:execution', newJob.id)
}

/*
Streams a current test
*/
export const handleCurrentTest = async (socket: Socket) => {
  const params = parse(socket.request.url?.split('?')[1] || '')

  const id = params['id']

  if (!id) {
    return
  }

  // Ensure id is not array
  if (Array.isArray(id)) {
    return
  }

  const pastMessages = Object.entries(
    await orchestratorReadRedis.hGetAll(`${id}:updates`)
  ).map(([, value]) => JSON.parse(value) as WorkerMessage | OrchestratorMessage)

  // Send past messages
  pastMessages.forEach((message) => socket.emit('updates', message))

  // Find latest timestamp in past messages
  const latestTimestamp = pastMessages.reduce(
    (latest, message) => {
      if (message.time > latest.time) {
        return message
      }
      return latest
    },
    { time: 0 }
  ).time

  // Stream updates
  orchestratorSubscribeRedis.subscribe(
    `orchestrator:executionUpdates:${id}`,
    (channel, message) => {
      const messageObject = JSON.parse(message) as
        | WorkerMessage
        | OrchestratorMessage

      if (messageObject.messageType === 'STATUS') {
        if (
          messageObject.message === 'ERROR' ||
          messageObject.message === 'SUCCESS'
        ) {
          setTimeout(() => {
            socket.disconnect()
          }, 1000)
        }
      }

      if (messageObject.time > latestTimestamp) {
        socket.emit('updates', messageObject)
      } else {
        // Check not in past messages
        if (
          !pastMessages.find(
            (message) =>
              message.time === messageObject.time &&
              message.message === messageObject.message
          )
        ) {
          socket.emit('updates', messageObject)
        }
      }
    }
  )
}
