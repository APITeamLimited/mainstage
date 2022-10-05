import { Buffer } from 'buffer'

import { EntityEngineServersideMessages } from '@apiteam/types'
import { Response } from 'k6/http'
import { Socket } from 'socket.io'
import { io } from 'socket.io-client'
import type { Socket as EntityEngineSocket } from 'socket.io-client'

import { checkValue } from '../../config'
import { coreCacheReadRedis } from '../../redis'

import { TestRunningState, runningTestStates } from '.'

const ENTITY_ENGINE_HOST = checkValue<string>('entity-engine.host')
const ENTITY_ENGINE_PORT = checkValue<number>('entity-engine.port')
const ENTITY_ENGINE_URL = `http://${ENTITY_ENGINE_HOST}:${ENTITY_ENGINE_PORT}`

/** Returns the entity engine socket, or creates a new one if it doesn't exist
 * yet*/
export const getEntityEngineSocket = async (
  clientSocket: Socket,
  scopeId: string,
  bearer: string,
  projectId: string
): Promise<EntityEngineSocket> => {
  if (!runningTestStates.has(clientSocket)) {
    throw new Error('No running test state found')
  }

  if (runningTestStates.get(clientSocket)?.entityEngineSocket) {
    const socket = runningTestStates.get(clientSocket)?.entityEngineSocket
    if (socket) return socket
  }

  const entityEngineSocket = io(ENTITY_ENGINE_URL, {
    path: '/internal/entity-engine/globe-test',
    query: {
      scopeId,
      bearer,
      projectId,
    } as EntityEngineServersideMessages['connection-params'],
  })

  // Disconnection is handled from entity engine side
  entityEngineSocket.on('rest-create-response:success', async (data) => {
    clientSocket.emit('rest-create-response:success', data)

    runningTestStates.set(clientSocket, {
      ...(runningTestStates.get(clientSocket) as TestRunningState),
      testType: 'rest',
      responseId: data.responseId as string,
      responseExistence: 'created',
    })

    // Create and delete a temporary id to enable streaming of tests by jobId

    await coreCacheReadRedis.set(`jobScopeId:${data.jobId}`, scopeId)

    entityEngineSocket.on('disconnect', async () => {
      await coreCacheReadRedis.del(`jobScopeId:${data.jobId}`)
    })
  })

  return await new Promise<EntityEngineSocket>((resolve) => {
    entityEngineSocket.on('connect', () => {
      runningTestStates.set(clientSocket, {
        ...runningTestStates.get(clientSocket),
        entityEngineSocket,
      } as TestRunningState)
      resolve(entityEngineSocket)
    })
  })
}

export const estimateRESTResponseSize = (response: Response): number => {
  // Create dummy response object to calculate the size of the response
  const dummyResponse = `HTTP/1.1 ${response.status} ${response.status_text}
  ${Object.entries(response.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r')}

  ${response.body?.toString()}`

  return Buffer.byteLength(dummyResponse, 'utf8')
}
