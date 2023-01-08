import { Scope } from '@prisma/client'
import type { Team, PlanInfo } from '@prisma/client'

import { getCoreCacheReadRedis } from '../../redis'

export const getPlanInfo = async (scope: Scope) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  if (scope.variant === 'TEAM') {
    const rawTeam = await coreCacheReadRedis.hGet(
      `team:${scope.variantTargetId}`,
      'team'
    )
    const team = rawTeam ? (JSON.parse(rawTeam) as Team) : null

    if (!team) {
      throw new Error('Team not found')
    }

    if (team.planInfoId) {
      const rawPlanInfo = await coreCacheReadRedis.hGet(
        'planInfo',
        scope.variantTargetId
      )

      if (!rawPlanInfo) {
        throw new Error('Plan info not found')
      }

      return JSON.parse(rawPlanInfo) as PlanInfo
    }

    return getFreePlanInfo()
  }

  const rawUser = await coreCacheReadRedis.get(
    `user__id:${scope.variantTargetId}`
  )
  const user = rawUser ? JSON.parse(rawUser) : null

  if (!user) {
    throw new Error('User not found')
  }

  if (!user.planInfoId) {
    const rawPlanInfo = await coreCacheReadRedis.hGet(
      'planInfo',
      scope.variantTargetId
    )

    if (!rawPlanInfo) {
      throw new Error('Plan info not found')
    }

    return JSON.parse(rawPlanInfo) as PlanInfo
  }

  return getFreePlanInfo()
}

const getFreePlanInfo = async () => {
  const allRawPlanInfos = await (
    await getCoreCacheReadRedis()
  ).hGetAll('planInfo')

  const allPlanInfos = Object.values(allRawPlanInfos).map((rawPlanInfo) =>
    JSON.parse(rawPlanInfo)
  ) as PlanInfo[]

  const freePlanInfo = allPlanInfos.find(
    (planInfo) => planInfo.priceMonthlyCents === 0 && planInfo.isActive
  )

  if (!freePlanInfo) {
    throw new Error('Free plan info not found')
  }

  return freePlanInfo
}
