import { stripe } from 'src/lib/stripe'
import { TeamModel } from 'src/models'

import { checkAuthenticated, checkOwnerAdmin } from '../guards'

export const invoices = ({ teamId }: { teamId?: string }) =>
  teamId ? getInvoicesTeam({ teamId }) : getInvoicesUser()

const getInvoicesTeam = async ({ teamId }: { teamId: string }) => {
  await checkOwnerAdmin({ teamId })

  const team = await TeamModel.get(teamId)

  if (!team) {
    throw new Error(`Team not found with id ${teamId}`)
  }

  if (!team.customerId) {
    throw new Error('Team does not have a customer id')
  }

  const invoices = await stripe.invoices.list({
    customer: team.customerId,
  })

  return invoices.data.filter((invoice) => invoice.number)
}

const getInvoicesUser = async () => {
  const user = await checkAuthenticated()

  if (!user.customerId) {
    throw new Error('User does not have a customer id')
  }

  const invoices = await stripe.invoices.list({
    customer: user.customerId,
  })

  return invoices.data.filter((invoice) => invoice.number)
}
