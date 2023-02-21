import { stripe } from '../../../lib/stripe'
import { PlanInfoModel, TeamModel } from '../../../models'
import { checkAuthenticated, checkOwnerAdmin } from '../../guards'

export const upcomingInvoice = async ({ teamId }: { teamId?: string }) =>
  teamId ? getUpcomingInvoiceTeam({ teamId }) : getUpcomingInvoiceUser()

const getUpcomingInvoiceTeam = async ({ teamId }: { teamId: string }) => {
  await checkOwnerAdmin({ teamId })

  const team = await TeamModel.get(teamId).then((team) => {
    if (!team) {
      throw new Error(`Team not found with id ${teamId}`)
    }

    return team
  })

  if (!team.customerId) {
    throw new Error('Team does not have a customer id')
  }

  if (!team.planInfoId) {
    throw new Error('Team does not have a plan info id')
  }

  const planInfo = await PlanInfoModel.get(team.planInfoId).then((planInfo) => {
    if (!planInfo) {
      throw new Error(`Plan info not found with id ${team.planInfoId}`)
    }

    return planInfo
  })

  if (planInfo.priceMonthlyCents === 0) {
    return null
  }

  const upcomingInvoice = await stripe.invoices
    .retrieveUpcoming({
      customer: team.customerId,
    })
    .catch(() => null)

  if (!upcomingInvoice) {
    return null
  }

  return {
    ...upcomingInvoice,
    planName: planInfo.verboseName,
  }
}

const getUpcomingInvoiceUser = async () => {
  const user = await checkAuthenticated()

  if (!user.customerId) {
    throw new Error('User does not have a customer id')
  }

  if (!user.planInfoId) {
    throw new Error('User does not have a plan info id')
  }

  const planInfo = await PlanInfoModel.get(user.planInfoId).then((planInfo) => {
    if (!planInfo) {
      throw new Error(`Plan info not found with id ${user.planInfoId}`)
    }

    return planInfo
  })

  if (planInfo.priceMonthlyCents === 0) {
    return null
  }

  const upcomingInvoice = await stripe.invoices
    .retrieveUpcoming({
      customer: user.customerId,
    })
    .catch(() => null)

  if (!upcomingInvoice) {
    return null
  }

  return {
    ...upcomingInvoice,
    planName: planInfo.verboseName,
  }
}
