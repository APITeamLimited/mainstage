import { ServiceValidationError } from '@redwoodjs/api'

import { getFreePlanInfo } from '../../helpers/billing'
import { PlanInfoModel, TeamModel, UserModel } from '../../models'

import { checkAuthenticated, checkMember } from '../guards'

export const currentPlan = async ({ teamId }: { teamId?: string }) =>
  teamId ? getPlanInfoTeam({ teamId }) : getPlanInfoUser()

const getPlanInfoTeam = async ({ teamId }: { teamId: string }) => {
  await checkMember({ teamId })

  const team = await TeamModel.get(teamId)

  if (!team) {
    throw new ServiceValidationError(`Team not found with id ${teamId}`)
  }

  if (team.planInfoId) {
    const planInfo = await PlanInfoModel.get(team.planInfoId)

    if (!planInfo) {
      throw new Error('Plan info not found')
    }

    return planInfo
  }

  // Create new plan info assume on free plan
  const freePlanInfo = await getFreePlanInfo()

  // Set the plan info on the team
  await TeamModel.update(teamId, {
    planInfoId: freePlanInfo.id,
  })

  return freePlanInfo
}

const getPlanInfoUser = async () => {
  const currentUser = await checkAuthenticated()

  if (currentUser.planInfoId) {
    const planInfo = await PlanInfoModel.get(currentUser.planInfoId)

    if (!planInfo) {
      throw new Error('Plan info not found')
    }

    return planInfo
  }

  // Create new plan info assume on free plan
  const freePlanInfo = await getFreePlanInfo()

  // Set the plan info on the user
  await UserModel.update(currentUser.id, {
    planInfoId: freePlanInfo.id,
  })

  return freePlanInfo
}
