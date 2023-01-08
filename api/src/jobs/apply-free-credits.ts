import type { PlanInfo } from '@prisma/client'
import type { Queue } from 'bullmq'

import { getFreePlanInfo } from 'src/helpers/billing'
import { db } from 'src/lib/db'
import { creditsReadRedis } from 'src/lib/redis'
import { TeamModel, UserModel } from 'src/models'

type WorkspaceInfo =
  | {
      team: {
        planInfo: PlanInfo | null
        id: string
        pastDue: boolean
      }
    }
  | {
      user: {
        planInfo: PlanInfo | null
        id: string
        pastDue: boolean
      }
    }

// Searches teams and users and applies free credits to any that are eligible
export const registerRecurringCreditsJob = async (queue: Queue) => {
  // Repeat every day at 1 am
  await queue.add(
    'applyFreeCredits',
    {},
    {
      repeat: {
        pattern: '0 * * * *',
      },
    }
  )

  // Run immediately
  applyFreeCredits()
}

export const applyFreeCredits = async (force = false, slow = false) => {
  await applyTeamFreeCredits(force, slow)
  await applyUserFreeCredits(force, slow)
}

const applyTeamFreeCredits = async (force: boolean, slow: boolean) => {
  // Sort teams by latest freeCreditsUpdatedAt
  let offset = 0
  let batchSize = 100

  // Loop through teams and apply free credits
  do {
    const teams = (
      await db.team.findMany({
        orderBy: { freeCreditsAddedAt: 'desc' },

        // Only return 100 teams at a time
        take: 100,
        skip: offset,

        select: {
          id: true,
          planInfo: true,
          freeCreditsAddedAt: true,
          pastDue: true,
        },
      })
    ).filter((team) =>
      force
        ? true
        : team.freeCreditsAddedAt
        ? new Date(team.freeCreditsAddedAt).getTime() <
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        : true
    )

    // Loop through teams and apply free credits
    if (teams.length === 0) {
      break
    }

    for (const team of teams) {
      if (slow) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      await processFreeCredits({ team }).catch((e) => {
        console.error('Error processing team free credits', team, e)
      })
    }

    offset += teams.length
    batchSize = teams.length
  } while (batchSize > 0)
}

const applyUserFreeCredits = async (force: boolean, slow: boolean) => {
  // Sort users by latest freeCreditsUpdatedAt
  let offset = 0
  let batchSize = 100

  // Loop through users and apply free credits
  // Only select freeCreditsAddedAt more than 30 days ago
  do {
    const users = (
      await db.user.findMany({
        orderBy: { freeCreditsAddedAt: 'desc' },

        // Only return 100 users at a time
        take: 1,
        skip: offset,

        select: {
          id: true,
          planInfo: true,
          freeCreditsAddedAt: true,
          pastDue: true,
        },
      })
    ).filter((user) =>
      force
        ? true
        : user.freeCreditsAddedAt
        ? new Date(user.freeCreditsAddedAt).getTime() <
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        : true
    )

    // Loop through users and apply free credits
    if (users.length === 0) {
      break
    }

    for (const user of users) {
      if (slow) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // If one fails, don't stop the whole batch
      await processFreeCredits({ user }).catch((e) => {
        console.error('Error processing user free credits', user, e)
      })
    }

    offset += users.length
    batchSize = users.length
  } while (batchSize > 0)
}

export const processFreeCredits = async (input: WorkspaceInfo) => {
  const planInfo = await getPlanInfo(input)
  const isTeam = 'team' in input

  const workspaceName = `${isTeam ? 'team' : 'user'}:${
    isTeam ? input.team.id : input.user.id
  }`

  const pastDue = isTeam ? input.team.pastDue : input.user.pastDue

  // If the workspace is past due, don't add free credits
  if (pastDue) {
    return
  }

  // Prevent multiple jobs from running at the same time resulting in duplicate credits
  const lockName = `${workspaceName}:lock`

  if (await creditsReadRedis.get(lockName)) {
    return
  }

  // Lock the workspace
  if ((await creditsReadRedis.incr(lockName)) !== 1) {
    return
  }

  // Set the lock to expire in 30 seconds in case the job fails
  await creditsReadRedis.expire(lockName, 30)

  // Reset free credits
  await Promise.all([
    creditsReadRedis.set(
      `${workspaceName}:freeCredits`,
      planInfo.monthlyCredits
    ),
    creditsReadRedis.set(
      `${workspaceName}:maxFreeCredits`,
      planInfo.monthlyCredits
    ),
  ])

  // Update team or user
  await (isTeam
    ? TeamModel.update(input.team.id, {
        freeCreditsAddedAt: new Date(),
      })
    : UserModel.update(input.user.id, {
        freeCreditsAddedAt: new Date(),
      }))

  // Unlock the workspace
  await creditsReadRedis.del(lockName)
}

const getPlanInfo = async (input: WorkspaceInfo) => {
  if ('team' in input) {
    if (input.team.planInfo) {
      return input.team.planInfo
    }

    // Create new plan info assume on free plan
    const freePlanInfo = await getFreePlanInfo()

    await TeamModel.update(input.team.id, {
      planInfoId: freePlanInfo.id,
    })

    return freePlanInfo
  }

  if (input.user.planInfo) {
    return input.user.planInfo
  }

  // Create new plan info assume on free plan
  const freePlanInfo = await getFreePlanInfo()

  // Set the plan info on the user
  await UserModel.update(input.user.id, {
    planInfoId: freePlanInfo.id,
  })

  return freePlanInfo
}
