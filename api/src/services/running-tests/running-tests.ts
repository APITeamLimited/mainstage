import { SummaryInfo } from '@apiteam/types'

import { ServiceValidationError } from '@redwoodjs/api'

import { coreCacheReadRedis } from 'src/lib/redis'

import { checkMember } from '../teams/validators/check-member'

export const runningTests = async ({ teamId }: { teamId: string | null }) => {
  if (!context.currentUser) throw new ServiceValidationError('Not logged in.')

  if (teamId) {
    await checkMember({ teamId })
  }

  const runningTests = Object.values(
    await coreCacheReadRedis.hGetAll(
      `workspace:${teamId ? 'TEAM' : 'USER'}:${
        teamId ?? context.currentUser.id
      }`
    )
  ).map((runningTest) => JSON.parse(runningTest) as SummaryInfo)

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

  const runningTestsCount = await coreCacheReadRedis.hLen(
    `workspace:${teamId ? 'TEAM' : 'USER'}:${teamId ?? context.currentUser.id}`
  )

  return runningTestsCount
}
