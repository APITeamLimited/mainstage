import { EntityEngineServersideMessages } from '@apiteam/types'
import { Scope } from '@prisma/client'
import { Socket } from 'socket.io'
import { io } from 'socket.io-client'
import type { Socket as EntityEngineSocket } from 'socket.io-client'

import { checkValue } from '../config'
import { getCoreCacheReadRedis } from '../lib/redis'

import { RunningTestState, runningTestStates } from '.'

const ENTITY_ENGINE_HOST = checkValue<string>('entity-engine.host')
const ENTITY_ENGINE_PORT = checkValue<number>('entity-engine.port')
const ENTITY_ENGINE_URL = `http://${ENTITY_ENGINE_HOST}:${ENTITY_ENGINE_PORT}`

/** Returns the entity engine socket, or creates a new one if it doesn't exist
 * yet*/
export const getEntityEngineSocket = async (
  clientSocket: Socket,
  scope: Scope,
  bearer: string,
  projectId: string,
  executionAgent: 'Local' | 'Cloud'
): Promise<EntityEngineSocket> => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  if (!runningTestStates.has(clientSocket)) {
    throw new Error('No running test state found')
  }

  if (runningTestStates.get(clientSocket)?.entityEngineSocket) {
    const socket = runningTestStates.get(clientSocket)?.entityEngineSocket
    if (socket) return socket
  }

  const entityEngineSocket = io(ENTITY_ENGINE_URL, {
    path: '/internal/entity-engine/test-manager',
    query: {
      scopeId: scope.id,
      bearer,
      projectId,
    } as EntityEngineServersideMessages['connection-params'],
  })

  // Disconnection is handled from entity engine side
  entityEngineSocket.once(
    'rest-create-response:success',
    async (data: { responseId: string; jobId: string }) => {
      clientSocket.emit('rest-create-response:success', data)

      runningTestStates.set(clientSocket, {
        ...(runningTestStates.get(clientSocket) as RunningTestState),
        testType: 'RESTRequest',
        responseId: data.responseId as string,
        responseExistence: 'created',
      })

      const jobScopeKey = `jobScopeId:${scope.variantTargetId}:${data.jobId}:${executionAgent}`

      // Create and delete a temporary id to enable streaming of tests by jobId
      await coreCacheReadRedis.set(jobScopeKey, scope.id)

      entityEngineSocket.on(
        'disconnect',
        async () => await coreCacheReadRedis.del(jobScopeKey)
      )
    }
  )

  entityEngineSocket.once(
    'folder-create-response:success',
    async (data: { responseId: string; jobId: string }) => {
      clientSocket.emit('folder-create-response:success', data)

      runningTestStates.set(clientSocket, {
        ...(runningTestStates.get(clientSocket) as RunningTestState),
        testType: 'Folder',
        responseId: data.responseId as string,
        responseExistence: 'created',
      })

      const jobScopeKey = `jobScopeId:${scope.variantTargetId}:${data.jobId}:${executionAgent}`

      // Create and delete a temporary id to enable streaming of tests by jobId
      await coreCacheReadRedis.set(jobScopeKey, scope.id)

      entityEngineSocket.on(
        'disconnect',
        async () => await coreCacheReadRedis.del(jobScopeKey)
      )
    }
  )

  entityEngineSocket.once(
    'collection-create-response:success',
    async (data: { responseId: string; jobId: string }) => {
      clientSocket.emit('collection-create-response:success', data)

      runningTestStates.set(clientSocket, {
        ...(runningTestStates.get(clientSocket) as RunningTestState),
        testType: 'Collection',
        responseId: data.responseId as string,
        responseExistence: 'created',
      })

      const jobScopeKey = `jobScopeId:${scope.variantTargetId}:${data.jobId}:${executionAgent}`

      // Create and delete a temporary id to enable streaming of tests by jobId
      await coreCacheReadRedis.set(jobScopeKey, scope.id)

      entityEngineSocket.on(
        'disconnect',
        async () => await coreCacheReadRedis.del(jobScopeKey)
      )
    }
  )

  // Delete entity engine socket after 1 hour if test is not completed
  const eeSocketTimeout = setTimeout(() => {
    entityEngineSocket.disconnect()
  }, 60 * 60 * 1000)

  entityEngineSocket.on('disconnect', () => clearTimeout(eeSocketTimeout))

  return new Promise<EntityEngineSocket>((resolve) => {
    entityEngineSocket.on('serverside-ready', () => {
      runningTestStates.set(clientSocket, {
        ...runningTestStates.get(clientSocket),
        entityEngineSocket,
      } as RunningTestState)
      resolve(entityEngineSocket)
    })
  })
}
