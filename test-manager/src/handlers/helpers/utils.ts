import { Buffer } from 'buffer'

import {
  EntityEngineServersideMessages,
  RunningTestInfo,
  StatusType,
} from '@apiteam/types'
import { Scope } from '@prisma/client'
import type { VerifiedDomain } from '@prisma/client'
import { Response } from 'k6/http'
import { Socket } from 'socket.io'
import { io } from 'socket.io-client'
import type { Socket as EntityEngineSocket } from 'socket.io-client'

import { checkValue } from '../../config'
import { getCoreCacheReadRedis } from '../../redis'

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
  entityEngineSocket.on('rest-create-response:success', async (data) => {
    clientSocket.emit('rest-create-response:success', data)

    runningTestStates.set(clientSocket, {
      ...(runningTestStates.get(clientSocket) as RunningTestState),
      testType: 'rest',
      responseId: data.responseId as string,
      responseExistence: 'created',
    })

    const jobScopeKey = `jobScopeId:${scope.variantTargetId}:${data.jobId}:${executionAgent}`

    // Create and delete a temporary id to enable streaming of tests by jobId
    await coreCacheReadRedis.set(jobScopeKey, scope.id)

    entityEngineSocket.on('disconnect', async () => {
      await coreCacheReadRedis.del(jobScopeKey)
    })
  })

  // Delete entity engine socket after 1 hour if test is not completed
  const eeSocketTimeout = setTimeout(() => {
    entityEngineSocket.disconnect()
  }, 60 * 60 * 1000)

  entityEngineSocket.on('disconnect', () =>
    clearTimeout(eeSocketTimeout)
  )

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

export const estimateRESTResponseSize = (response: Response): number => {
  // Create dummy response object to calculate the size of the response
  const dummyResponse = `HTTP/1.1 ${response.status} ${response.status_text}
  ${Object.entries(response.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r')}

  ${response.body?.toString()}`

  return Buffer.byteLength(dummyResponse, 'utf8')
}

export const getVerifiedDomains = async (
  variant: string,
  variantTargetId: string
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  const verifiedDomainIds = (
    await coreCacheReadRedis.sMembers(
      `verifiedDomain__variant:${variant}__variantTargetId:${variantTargetId}`
    )
  ).map((id) => `verifiedDomain__id:${id}`)

  const verifiedDomains = (
    verifiedDomainIds.length > 0
      ? await coreCacheReadRedis.mGet(verifiedDomainIds)
      : []
  )
    .filter((verifiedDomain) => verifiedDomain !== null)
    .map((verifiedDomain) =>
      JSON.parse(verifiedDomain as string)
    ) as VerifiedDomain[]

  return verifiedDomains
    .filter((verifiedDomain) => verifiedDomain.verified)
    .map((verifiedDomain) => verifiedDomain.domain)
}

export const updateTestInfo = async (
  jobId: string,
  status: StatusType,
  runningTestKey: string
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  // Delete test info if completed
  if (status === 'COMPLETED_SUCCESS' || status === 'COMPLETED_FAILURE') {
    console.log('Delete 1')
    await coreCacheReadRedis.hDel(runningTestKey, jobId)
    return
  }

  const testInfo = await coreCacheReadRedis.hGet(runningTestKey, jobId)

  if (!testInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Test info not found')
    }
    return
  }

  const parsedTestInfo = JSON.parse(testInfo) as RunningTestInfo

  await coreCacheReadRedis.hSet(
    runningTestKey,
    jobId,
    JSON.stringify({
      ...parsedTestInfo,
      status,
    })
  )
}
