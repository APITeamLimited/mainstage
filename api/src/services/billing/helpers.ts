import { UserAsPersonal } from '@apiteam/types-commonjs'
import type { Team } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { CustomerModel, TeamModel, PlanInfoModel } from '../../models'
import { checkAuthenticated, checkOwnerAdmin } from '../guards'

export type WorkspaceContext =
  | {
      user: UserAsPersonal
    }
  | {
      team: Team
    }

export const authenticateAndGetContext = async (teamId?: string) => {
  if (teamId) {
    await checkOwnerAdmin({ teamId })

    const team = await TeamModel.get(teamId)

    if (!team) {
      throw new ServiceValidationError(`Team with id ${teamId} not found`)
    }

    if (!team.planInfoId) {
      throw new Error(`Team with id ${teamId} does not have a planInfoId`)
    }

    const planInfo = await PlanInfoModel.get(team.planInfoId)

    if (!planInfo) {
      throw new Error(`Team with id ${teamId} does not have a valid planInfoId`)
    }

    return {
      team,
      existingPlanInfo: planInfo,
    }
  }

  const user = await checkAuthenticated()

  if (!user.planInfoId) {
    throw new Error(`User with id ${user.id} does not have a planInfoId`)
  }

  const planInfo = await PlanInfoModel.get(user.planInfoId)

  if (!planInfo) {
    throw new Error(`User with id ${user.id} does not have a valid planInfoId`)
  }

  return {
    user,
    existingPlanInfo: planInfo,
  }
}

export const getCustomer = async (workspaceContext: WorkspaceContext) => {
  let customerId: string | null = null

  if ('team' in workspaceContext) {
    customerId = workspaceContext.team.customerId
  } else {
    customerId = workspaceContext.user.customerId
  }

  if (!customerId) {
    throw new Error(`Customer id not found for ${workspaceContext}`)
  }

  const customer = await CustomerModel.get(customerId)

  if (!customer) {
    throw new Error(
      `Customer with id ${customerId} not found for ${workspaceContext}`
    )
  }

  if (customer.deleted) {
    throw new Error(`Customer with id ${customerId} is deleted`)
  }

  return customer
}
