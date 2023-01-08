import {
  WrappedExecutionParams,
  ExecutionParams,
  AuthenticatedSocket,
  RunningTestInfo,
  JobUserUpdateMessage,
  parseAndValidateGlobeTestMessage,
} from '@apiteam/types'
import type { Scope } from '@prisma/client'
import { parse } from 'query-string'
import { v4 as uuid } from 'uuid'

import {
  getCoreCacheReadRedis,
  getCoreCacheSubscribeRedis,
  getOrchestratorReadRedis,
  getOrchestratorSubscribeRedis,
  RedisClient,
} from '../redis'
import { validateParams } from '../validator'

import {
  getEntityEngineSocket,
  getVerifiedDomains,
  runningTestStates,
  handleMessage,
  getPlanInfo,
  getAvailableCredits,
} from './helpers'

export const getRemoteTestLogsKey = (jobId: string) => `${jobId}:updates`
export const getRemoteTestUpdatesKey = (jobId: string) =>
  `orchestrator:executionUpdates:${jobId}`

// Creates a new test and streams the result
export const handleNewTest = async (socket: AuthenticatedSocket) => {
  const [
    coreCacheReadRedis,
    coreCacheSubscribeRedis,
    orchestratorReadRedis,
    orchestratorSubscribeRedis,
  ] = await Promise.all([
    getCoreCacheReadRedis(),
    getCoreCacheSubscribeRedis(),
    getOrchestratorReadRedis(),
    getOrchestratorSubscribeRedis(),
  ])

  let params = null as WrappedExecutionParams | null

  try {
    params = validateParams(parse(socket.request.url?.split('?')[1] || ''))
    if (!params) throw new Error('Invalid params')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // Close the socket if the params are invalid
    socket.emit('error', e.message)
    socket.disconnect()
    return
  }

  const runningTestKey = `workspace-cloud-tests:${socket.scope.variant}:${socket.scope.variantTargetId}`

  const [planinfo, runningCloudTestsCount, availableCredits] =
    await Promise.all([
      getPlanInfo(socket.scope),
      coreCacheReadRedis.hLen(runningTestKey),
      getAvailableCredits(socket.scope),
    ])

  // Check workspace hasn't already got too many tests already running
  if (runningCloudTestsCount >= planinfo.maxConcurrentCloudTests) {
    socket.emit(
      'error',
      `You can only run ${planinfo.maxConcurrentCloudTests} tests at once on your plan ${planinfo.verboseName}`
    )
    socket.disconnect()
    return
  }

  if (availableCredits <= 0) {
    socket.emit(
      'error',
      `You don't have any credits left to run tests. Please top up your account.`
    )
    socket.disconnect()
    return
  }

  runningTestStates.set(socket, {
    testType: 'undetermined',
    responseExistence: 'none',
  })

  // Calling this first here seems to prevent the race condition
  const [_, verifiedDomains] = await Promise.all([
    getEntityEngineSocket(
      socket,
      socket.scope,
      params.bearer,
      params.projectId,
      'Cloud'
    ),
    await getVerifiedDomains(
      socket.scope.variant,
      socket.scope.variantTargetId
    ),
  ])

  const executionParams: ExecutionParams = {
    id: uuid(),
    source: params.source,
    sourceName: params.sourceName,
    environmentContext: params.environmentContext,
    collectionContext: params.collectionContext,
    finalRequest: params.finalRequest,
    underlyingRequest: params.underlyingRequest,
    scope: {
      variant: socket.scope.variant as 'USER' | 'TEAM',
      variantTargetId: socket.scope.variantTargetId,
      userId: socket.scope.userId,
    },
    verifiedDomains,
    createdAt: new Date().toISOString(),
    funcModeInfo: {
      instance100msUnitRate: 1,
    },
    permittedLoadZones: planinfo.loadZones,
    maxTestDurationMinutes: planinfo.maxTestDurationMinutes,
    maxSimulatedUsers: planinfo.maxSimulatedUsers,
  }

  // Start stream before scheduling to ensure all messages are received
  orchestratorSubscribeRedis.subscribe(
    `orchestrator:executionUpdates:${executionParams.id}`,
    (message) => {
      const parseResult = parseAndValidateGlobeTestMessage(message)

      if (!parseResult.success) {
        return
      }

      socket.emit('updates', parseResult.data)

      handleMessage(
        parseResult.data,
        socket,
        params as WrappedExecutionParams,
        executionParams.id,
        runningTestKey,
        'Cloud'
      )
    }
  )

  const runningTestInfo: RunningTestInfo = {
    jobId: executionParams.id,
    sourceName: executionParams.sourceName,
    createdByUserId: socket.scope.userId,
    createdAt: executionParams.createdAt,
    status: 'ASSIGNED',
  }

  // Set job info first to prevent race condition
  await Promise.all([
    orchestratorReadRedis.hSet(
      executionParams.id,
      'job',
      JSON.stringify(executionParams)
    ),
    coreCacheReadRedis.hSet(
      runningTestKey,
      runningTestInfo.jobId,
      JSON.stringify(runningTestInfo)
    ),
    // Listen for job updates
    coreCacheSubscribeRedis.subscribe(
      `jobUserUpdates:${socket.scope.variant}:${socket.scope.variantTargetId}:${runningTestInfo.jobId}`,
      (message) =>
        handleJobUserUpdates(
          message,
          socket.scope,
          executionParams.id,
          runningTestKey,
          coreCacheReadRedis,
          orchestratorReadRedis
        )
    ),
  ])

  // Broadcast the new job
  await Promise.all([
    orchestratorReadRedis.sAdd(
      'orchestrator:executionHistory',
      executionParams.id
    ),
    orchestratorReadRedis.publish('orchestrator:execution', executionParams.id),
  ])
}

const handleJobUserUpdates = (
  message: string,
  scope: Scope,
  jobId: string,
  runningTestKey: string,
  coreCacheReadRedis: RedisClient,
  orchestratorReadRedis: RedisClient
) => {
  const parsedMessage = JSON.parse(message) as JobUserUpdateMessage

  if (parsedMessage.updateType === 'CANCEL') {
    orchestratorReadRedis.publish(
      `jobUserUpdates:${scope.variant}:${scope.variantTargetId}:${jobId}`,
      JSON.stringify({
        updateType: 'CANCEL',
      })
    )

    // In case of stray jobs cleanup
    setTimeout(() => {
      coreCacheReadRedis.hDel(runningTestKey, jobId)
    }, 10000)
  }
}
