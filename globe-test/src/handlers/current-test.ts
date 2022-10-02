import { GlobeTestMessage } from '@apiteam/types'
import { parse } from 'query-string'
import { Socket } from 'socket.io'

import { orchestratorReadRedis, orchestratorSubscribeRedis } from '../redis'

// Streams an ongoing test
export const handleCurrentTest = async (socket: Socket) => {
  const params = parse(socket.request.url?.split('?')[1] || '')

  const id = params['id']

  if (typeof id !== 'string') {
    socket.emit('error', 'Invalid jobId')
    socket.disconnect()
    return
  }

  const pastMessages = Object.entries(
    await orchestratorReadRedis.hGetAll(`${id}:updates`)
  ).map(([, value]) => JSON.parse(value) as GlobeTestMessage)

  // Send past messages
  pastMessages.forEach((message) => socket.emit('updates', message))

  // Find latest timestamp in past messages
  const latestTimestamp = pastMessages.reduce(
    (latest, message) => {
      const messageTime = new Date(message.time).getTime()
      if (messageTime > latest.time) {
        return { time: messageTime }
      }
      return latest
    },
    { time: 0 }
  ).time

  // Stream updates
  orchestratorSubscribeRedis.subscribe(
    `orchestrator:executionUpdates:${id}`,
    (channel, message) => {
      const messageObject = JSON.parse(message) as GlobeTestMessage

      if (messageObject.messageType === 'STATUS') {
        if (
          messageObject.message === 'COMPLETED_SUCCESS' ||
          messageObject.message === 'COMPLETED_FAILED'
        ) {
          // In case of linering client, force disconnect after 1 second
          setTimeout(() => {
            socket.disconnect()
          }, 1000)
        }
      }

      if (new Date(messageObject.time).getTime() > latestTimestamp) {
        socket.emit('updates', messageObject)
      } else {
        // Check not in past messages
        // This is an expensive operation, but should be a rare edge case
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
