import { TeamModel, UserModel } from 'src/models'

import { checkAuthenticated, checkMember } from '../guards'

export const trialEligibility = async ({ teamId }: { teamId?: string }) =>
  teamId ? checkTrialEligibilityTeam({ teamId }) : checkTrialEligibilityUser()

const checkTrialEligibilityTeam = async ({ teamId }: { teamId: string }) => {
  await checkMember({ teamId })

  const team = await TeamModel.get(teamId)

  if (!team) {
    throw new Error(`Team not found with id ${teamId}`)
  }

  const ownerMembership = await TeamModel.getOwnerMembership(teamId)

  if (!ownerMembership) {
    throw new Error('Team owner membership not found')
  }

  const owner = await UserModel.get(ownerMembership.userId)

  if (!owner) {
    throw new Error('Team owner not found')
  }

  // Ensure team and owner haven't had a free trial
  return !team.hadFreeTrial && !owner.hadFreeTrial
}

const checkTrialEligibilityUser = async () => {
  const user = await checkAuthenticated()

  return !user.hadFreeTrial
}
