import type { Team, Membership, PlanInfo } from '@prisma/client'

import { db } from 'src/lib/db'
import { getCoreCacheReadRedis, getCreditsReadRedis } from 'src/lib/redis'

import { TeamModel } from '.'

export const setTeamRedis = async (
  team: Team,
  oppType: 'CREATE' | 'UPDATE'
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await coreCacheReadRedis.hSet(`team:${team.id}`, 'team', JSON.stringify(team))

  await coreCacheReadRedis.publish(
    `team:${team.id}`,
    JSON.stringify({
      type: oppType,
      payload: team,
    })
  )
}

export const setMembershipRedis = async (membership: Membership) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.hSet(
      `team:${membership.teamId}`,
      `membership:${membership.id}`,
      JSON.stringify(membership)
    ),

    coreCacheReadRedis.publish(
      `team:${membership.teamId}`,
      JSON.stringify({
        type: 'ADD_MEMBER',
        payload: membership,
      })
    ),
  ])
}

export const deleteMembershipRedis = async (membership: Membership) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.hDel(
      `team:${membership.teamId}`,
      `membership:${membership.id}`
    ),

    coreCacheReadRedis.publish(
      `team:${membership.teamId}`,
      JSON.stringify({
        type: 'REMOVE_MEMBER',
        payload: membership,
      })
    ),
  ])
}

export const rebuildMembershipsCache = async () => {
  let skip = 0
  let batchSize = 100

  do {
    const memberships = await db.membership.findMany({
      skip,
      take: batchSize,
    })

    await Promise.all(memberships.map(setMembershipRedis))

    skip += memberships.length
    batchSize = memberships.length
  } while (batchSize > 0)
}

export const createFreeCredits = async (
  teamId: string,
  planInfo: PlanInfo,
  pastDue: boolean
) => {
  if (pastDue) {
    // If the team is past due, don't add free credits
    return
  }

  const creditsReadRedis = await getCreditsReadRedis()

  await Promise.all([
    // Reset free credits
    creditsReadRedis.set(`TEAM:${teamId}:freeCredits`, planInfo.monthlyCredits),

    creditsReadRedis.set(
      `TEAM:${teamId}:maxFreeCredits`,
      planInfo.monthlyCredits
    ),

    TeamModel.update(teamId, {
      freeCreditsAddedAt: new Date(),
    }),
  ])
}
