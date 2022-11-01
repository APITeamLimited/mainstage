import { Buffer } from 'buffer'

import {
  EntityEngineServersideMessages,
  GlobeTestMessage,
  RunningTestInfo,
  StatusType,
} from '@apiteam/types'
import type { VerifiedDomain } from '@prisma/client'
import type { Scope } from '@prisma/client'
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

export const getVerifiedDomains = async (
  variant: string,
  variantTargetId: string
) => {
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
}

export const updateTestInfo = async (
  scope: Scope,
  jobId: string,
  status: StatusType
) => {
  // Delete test info if completed
  if (
    status === 'COMPLETED_SUCCESS' ||
    status === 'COMPLETED_FAILURE' ||
    status === 'SUCCESS' ||
    status === 'FAILURE'
  ) {
    await coreCacheReadRedis.hDel(
      `workspace:${scope.variant}:${scope.variantTargetId}`,
      jobId
    )
    return
  }

  const testInfo = await coreCacheReadRedis.hGet(
    `workspace:${scope.variant}:${scope.variantTargetId}`,
    jobId
  )

  if (!testInfo) {
    console.warn('Test info not found')
    return
  }

  const parsedTestInfo = JSON.parse(testInfo) as RunningTestInfo

  await coreCacheReadRedis.hSet(
    `workspace:${scope.variant}:${scope.variantTargetId}`,
    jobId,
    JSON.stringify({
      ...parsedTestInfo,
      status,
    })
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseMessage = (message: any) => {
  if (
    message.messageType === 'SUMMARY_METRICS' ||
    message.messageType === 'METRICS' ||
    message.messageType === 'MARK' ||
    message.messageType === 'JOB_INFO' ||
    message.messageType === 'CONSOLE' ||
    message.messageType === 'OPTIONS'
  ) {
    message.message = JSON.parse(message.message)
    message.time = new Date(message.time)
  }

  return message as GlobeTestMessage
}
