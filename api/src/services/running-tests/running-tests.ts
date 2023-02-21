import { RunningTestInfo } from '@apiteam/types-commonjs'

import { ServiceValidationError } from '@redwoodjs/api'

import { getCoreCacheReadRedis } from '../../lib/redis'
import { checkMember } from '../../services/guards'

export const runningTests = async ({ teamId }: { teamId: string | null }) => {
  if (!context.currentUser) throw new ServiceValidationError('Not logged in.')

  if (teamId) {
    await checkMember({ teamId })
  }

  const runningTests = Object.values(
    await (
      await getCoreCacheReadRedis()
    ).hGetAll(
      `workspace-cloud-tests:${teamId ? 'TEAM' : 'USER'}:${
        teamId ?? context.currentUser.id
      }`
    )
  ).map((runningTest) => JSON.parse(runningTest) as RunningTestInfo)

  return runningTests
}

export const runningTestsCount = async ({
  teamId,
}: {
  teamId: string | null
}) => {
  if (!context.currentUser) throw new ServiceValidationError('Not logged in.')

  if (teamId) {
    await checkMember({ teamId })
  }

  const runningTestsCount = await (
    await getCoreCacheReadRedis()
  ).hLen(
    `workspace-cloud-tests:${teamId ? 'TEAM' : 'USER'}:${
      teamId ?? context.currentUser.id
    }`
  )

  return runningTestsCount
}

export const cancelRunningTest = async ({
  teamId,
  jobId,
}: {
  teamId: string | null
  jobId: string
}) => {
  if (!context.currentUser) throw new ServiceValidationError('Not logged in.')

  if (teamId) {
    await checkMember({ teamId })
  }

  const scopeVariant = teamId ? 'TEAM' : 'USER'
  const scopeVariantTargetId = teamId ?? context.currentUser.id

  const coreCacheReadRedis = await getCoreCacheReadRedis()

  const runningTestInfoRaw = await coreCacheReadRedis.hGet(
    `workspace-cloud-tests:${scopeVariant}:${scopeVariantTargetId}`,
    jobId
  )

  if (!runningTestInfoRaw) {
    throw new ServiceValidationError('Test not found.')
  }

  coreCacheReadRedis.publish(
    `jobUserUpdates:${scopeVariant}:${scopeVariantTargetId}:${jobId}`,
    JSON.stringify({
      updateType: 'CANCEL',
    })
  )

  // In case a rogue test is still listed by error, we need to remove it from the running tests list
  setTimeout(() => {
    coreCacheReadRedis.hDel(
      `workspace-cloud-tests:${scopeVariant}:${scopeVariantTargetId}`,
      jobId
    )

    // Publish once more in case orchestrator went down before receiving the first message
    coreCacheReadRedis.publish(
      `jobUserUpdates:${scopeVariant}:${scopeVariantTargetId}:${jobId}`,
      JSON.stringify({
        updateType: 'CANCEL',
      })
    )
  }, 10000)

  return true
}
