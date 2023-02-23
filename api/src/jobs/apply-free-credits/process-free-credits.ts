import type { PlanInfo } from '@prisma/client'

import { getFreePlanInfo } from 'src/helpers/billing'
import { getCreditsReadRedis } from 'src/lib/redis'
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

export const processFreeCredits = async (input: WorkspaceInfo) => {
  const planInfo = await getPlanInfo(input)
  const isTeam = 'team' in input

  const workspaceName = `${isTeam ? 'TEAM' : 'USER'}:${
    isTeam ? input.team.id : input.user.id
  }`

  const pastDue = isTeam ? input.team.pastDue : input.user.pastDue

  // If the workspace is past due, don't add free credits
  if (pastDue) {
    return
  }

  // Prevent multiple jobs from running at the same time resulting in duplicate credits
  const lockName = `${workspaceName}:lock`

  const creditsReadRedis = await getCreditsReadRedis()

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
