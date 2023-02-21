import { ServiceValidationError } from '@redwoodjs/api'

import { createTeamScope } from '../../helpers'
import { getFreePlanInfo } from '../../helpers/billing'
import { db } from '../../lib/db'
import { CustomerModel, PlanInfoModel } from '../billing'

import { determineIfNeedKickMembers } from './determine-if-need-kick-members'
import { createFreeCredits, setTeamRedis } from './redis-helpers'

import { AbstractUpdateTeamInput, TeamModel } from '.'

export const handleTeamUpdate = async (
  id: string,
  input: AbstractUpdateTeamInput
): ReturnType<(typeof TeamModel)['update']> => {
  const oldTeam = await TeamModel.get(id)

  if (!oldTeam) {
    throw new ServiceValidationError(`Team not found with id '${id}'`)
  }

  const updatedTeam = await db.team.update({
    where: {
      id,
    },
    data: input,
  })

  await setTeamRedis(updatedTeam, 'UPDATE')

  let planInfo = updatedTeam.planInfoId
    ? await PlanInfoModel.get(updatedTeam.planInfoId)
    : null

  if ('planInfoId' in input && input.planInfoId) {
    planInfo = await PlanInfoModel.get(input.planInfoId)

    if (!planInfo) {
      throw new ServiceValidationError(
        `PlanInfo not found with id '${input.planInfoId}'`
      )
    }

    if (planInfo.priceMonthlyCents === 0) {
      await determineIfNeedKickMembers(updatedTeam, planInfo)
    }

    await createFreeCredits(updatedTeam.id, planInfo, updatedTeam.pastDue)
  }

  const memberships = await db.membership.findMany({
    where: {
      teamId: id,
    },
  })

  const userIds = memberships.map((m) => m.userId)

  const users = await db.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  })

  // Call createTeamScope for each scope
  await Promise.all(
    memberships.map(async (membership) => {
      const user = users.find((u) => u.id === membership.userId)

      if (!user) {
        throw new Error(`User not found with id '${membership.userId}'`)
      }

      return createTeamScope(
        updatedTeam,
        membership,
        user,
        planInfo ?? (await getFreePlanInfo())
      )
    })
  )

  const customerId = await TeamModel.getOrCreateCustomerId(updatedTeam.id)

  const customer = await CustomerModel.get(customerId)

  if (!customer) {
    throw new Error(`Customer not found with id '${customerId}'`)
  }

  if (input.name && oldTeam.name === customer.name) {
    await CustomerModel.update(customerId, { name: input.name })
  }

  return updatedTeam
}
