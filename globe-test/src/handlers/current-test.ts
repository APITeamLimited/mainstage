import { AuthenticatedSocket, GlobeTestMessage } from '@apiteam/types'
import { Scope } from '@prisma/client'
import type { Jwt } from 'jsonwebtoken'
import { parse } from 'query-string'

import {
  coreCacheReadRedis,
  orchestratorReadRedis,
  orchestratorSubscribeRedis,
} from '../redis'

// Streams an ongoing test
export const handleCurrentTest = async (socket: AuthenticatedSocket) => {
  const params = parse(socket.request.url?.split('?')[1] || '')

  if (typeof params.jobId !== 'string') {
    socket.emit('error', 'Invalid jobId')
    socket.disconnect()
    return
  }

  // Get job
  const jobScopeId = await coreCacheReadRedis.get(`jobScopeId:${params.jobId}`)

  if (!jobScopeId) {
    socket.emit('error', 'Invalid jobId')
    socket.disconnect()
    return
  }

  const jobScopeRaw = await coreCacheReadRedis.get(`scope__id:${jobScopeId}`)

  if (!jobScopeRaw) {
    socket.emit('error', 'Invalid jobId')
    socket.disconnect()
    return
  }

  const jobScope = JSON.parse(jobScopeRaw) as Scope
  const userScope = socket.scope

  if (jobScope.variantTargetId !== userScope.variantTargetId) {
    socket.emit('error', 'Invalid jobId')
    socket.disconnect()
    return
  }

  // Client now authorized to receive updates on this job
  console.log(new Date(), 'Client authenticated, /current-test')

  const pastMessages = (
    await orchestratorReadRedis.sMembers(`${params.jobId}:updates`)
  ).map((value) => JSON.parse(value) as GlobeTestMessage)

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
    `orchestrator:executionUpdates:${params.jobId}`,
    (message) => {
      const messageObject = JSON.parse(message) as GlobeTestMessage

      if (messageObject.messageType === 'STATUS') {
        if (
          messageObject.message === 'COMPLETED_SUCCESS' ||
          messageObject.message === 'COMPLETED_FAILURE'
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
