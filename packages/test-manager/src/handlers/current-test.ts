import {
  AuthenticatedSocket,
  GlobeTestMessage,
  parseAndValidateGlobeTestMessage,
  parseGlobeTestMessage,
} from '@apiteam/types'
import type { Scope } from '@prisma/client'
import { parse } from 'query-string'

import {
  getCoreCacheReadRedis,
  getOrchestratorReadRedis,
  getOrchestratorSubscribeRedis,
} from '../lib/redis'

import { getLocalTestLogsKey, getLocalTestUpdatesKey } from './new-local-test'
import { getRemoteTestLogsKey, getRemoteTestUpdatesKey } from './new-test'

// Streams an ongoing test
export const handleCurrentTest = async (socket: AuthenticatedSocket) => {
  const [
    coreCacheReadRedis,
    orchestratorReadRedis,
    orchestratorSubscribeRedis,
  ] = await Promise.all([
    getCoreCacheReadRedis(),
    getOrchestratorReadRedis(),
    getOrchestratorSubscribeRedis(),
  ])

  const params = parse(socket.request.url?.split('?')[1] || '')

  if (typeof params.jobId !== 'string') {
    socket.emit('error', 'Invalid jobId')
    socket.disconnect()
    return
  }

  if (typeof params.executionAgent !== 'string') {
    socket.emit('error', 'Invalid executionAgent')
    socket.disconnect()
    return
  }

  // Get job
  const jobScopeId = await coreCacheReadRedis.get(
    `jobScopeId:${socket.scope.variantTargetId}:${params.jobId}:${params.executionAgent}`
  )

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

  const pastMessages = (
    await orchestratorReadRedis.sMembers(
      params.executionAgent === 'Local'
        ? getLocalTestLogsKey(userScope, params.jobId)
        : getRemoteTestLogsKey(params.jobId)
    )
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
    params.executionAgent === 'Local'
      ? getLocalTestUpdatesKey(userScope, params.jobId)
      : getRemoteTestUpdatesKey(params.jobId),
    (message: unknown) => {
      const parseResult = parseAndValidateGlobeTestMessage(message)

      if (!parseResult.success) {
        console.warn(
          'Invalid globe test message',
          JSON.stringify(parseGlobeTestMessage(message)),
          parseResult.error
        )
        return
      }

      const parsedMessage = parseResult.data

      if (parsedMessage.messageType === 'STATUS') {
        if (
          parsedMessage.message === 'SUCCESS' ||
          parsedMessage.message === 'FAILURE' ||
          parsedMessage.message === 'COMPLETED_SUCCESS' ||
          parsedMessage.message === 'COMPLETED_FAILURE'
        ) {
          // In case of linering client, force disconnect after 10 seconds
          setTimeout(() => {
            socket.disconnect()
          }, 10000)
        }
      }

      if (new Date(parsedMessage.time).getTime() > latestTimestamp) {
        socket.emit('updates', parsedMessage)
      } else {
        // Check not in past messages
        // This is an expensive operation, but should be a rare edge case
        if (
          !pastMessages.find(
            (message) =>
              message.time === parsedMessage.time &&
              message.message === parsedMessage.message
          )
        ) {
          socket.emit('updates', parsedMessage)
        }
      }
    }
  )
}
