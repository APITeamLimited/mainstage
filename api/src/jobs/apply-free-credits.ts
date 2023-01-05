import { Team, User, PlanInfo } from '@prisma/client'

import { getFreePlanInfo } from 'src/helpers/billing'
import { db } from 'src/lib/db'
import { TeamModel, UserModel } from 'src/models'

type WorkspaceInfo =
  | {
      team: {
        planInfo: PlanInfo | null
        id: string
      }
    }
  | {
      user: {
        planInfo: PlanInfo | null
        id: string
      }
    }

// Searches teams and users and applies free credits to any that are eligible
export const applyFreeCredits = async () => {
  await applyTeamFreeCredits()
  await applyUserFreeCredits()
}

const applyTeamFreeCredits = async () => {
  // Sort teams by latest freeCreditsUpdatedAt
  let offset = 0
  let batchSize = 100

  // Loop through teams and apply free credits
  do {
    const teams = await db.team.findMany({
      orderBy: { freeCreditsAddedAt: 'desc' },

      // Only return 100 teams at a time
      take: 100,
      skip: offset,

      select: {
        id: true,
        planInfo: true,
      },
    })

    // Loop through teams and apply free credits
    if (teams.length === 0) {
      break
    }

    offset += teams.length
    batchSize = teams.length
  } while (batchSize > 0)
}

const applyUserFreeCredits = async () => {
  // Sort users by latest freeCreditsUpdatedAt
  let offset = 0
  let batchSize = 100

  // Loop through users and apply free credits
  do {
    const users = await db.user.findMany({
      orderBy: { freeCreditsAddedAt: 'desc' },

      // Only return 100 users at a time
      take: 20,
      skip: offset,

      select: {
        id: true,
        planInfo: true,
      },
    })

    // Loop through users and apply free credits
    if (users.length === 0) {
      break
    }

    await Promise.all(users.map((user) => processWorkspace({ user })))

    offset += users.length
    batchSize = users.length
  } while (batchSize > 0)
}

const processWorkspace = async (input: WorkspaceInfo) => {
  const planInfo = await getPlanInfo(input)

  // Add
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
  } else {
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
}
