import queryString from 'query-string'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'

import { orchestratorReadRedis, orchestratorSubscribeRedis } from './redis'

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
  const params = queryString.parse(socket.request.url?.split('?')[1] || '')

  // Ensure no params are arrays
  if (Array.isArray(params.scopeId)) {
    throw new Error('scopeId must be a string')
  }

  if (Array.isArray(params.source)) {
    throw new Error('source must be a string')
  }

  if (Array.isArray(params.sourceName)) {
    throw new Error('sourceName must be a string')
  }

  if (!params.source) {
    throw new Error('source is required')
  }

  if (!params.sourceName) {
    throw new Error('sourceName is required')
  }

  if (!params.scopeId) {
    throw new Error('scopeId is required')
  }

  const newJob = {
    id: uuid(),
    source: params.source,
    sourceName: params.sourceName,
    options: JSON.stringify(params.options || {}),
    scopeId: params.scopeId,
    status: 'PENDING',
  }

  console.log('newJob', newJob)

  await Promise.all(
    Object.entries(newJob).map(([key, value]) =>
      orchestratorReadRedis.hSet(newJob.id, key, value)
    )
  )

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

  // Broadcast the new job
  await orchestratorReadRedis.sAdd('orchestrator:executionHistory', newJob.id)
  await orchestratorReadRedis.publish('orchestrator:execution', newJob.id)
}

/*
Streams a current test
*/
export const handleCurrentTest = async (socket: Socket) => {
  const params = queryString.parse(socket.request.url?.split('?')[1] || '')

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
