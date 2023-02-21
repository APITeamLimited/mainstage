import { stripe } from '../../../lib/stripe'
import { TeamModel } from '../../../models'
import { ensureCorrectDescriptionInvoice } from '../../../utils/ensure-correct-description-invoice'
import { checkAuthenticated, checkOwnerAdmin } from '../../guards'

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

  const numberedInvoices = invoices.data.filter((invoice) => invoice.number)

  return numberedInvoices.map(ensureCorrectDescriptionInvoice)
}

const getInvoicesUser = async () => {
  const user = await checkAuthenticated()

  if (!user.customerId) {
    throw new Error('User does not have a customer id')
  }

  const invoices = await stripe.invoices.list({
    customer: user.customerId,
  })

  const numberedInvoices = invoices.data.filter((invoice) => invoice.number)

  return numberedInvoices.map(ensureCorrectDescriptionInvoice)
}

export const invoice = async ({
  invoiceId,
  teamId,
}: {
  invoiceId: string
  teamId?: string
}) =>
  teamId ? getInvoiceTeam({ invoiceId, teamId }) : getInvoiceUser({ invoiceId })

const getInvoiceTeam = async ({
  invoiceId,
  teamId,
}: {
  invoiceId: string
  teamId: string
}) => {
  await checkOwnerAdmin({ teamId })

  const team = await TeamModel.get(teamId)

  if (!team) {
    throw new Error(`Team not found with id ${teamId}`)
  }

  if (!team.customerId) {
    throw new Error('Team does not have a customer id')
  }

  const invoice = await stripe.invoices.retrieve(invoiceId).catch(() => null)

  return invoice && invoice.number
    ? ensureCorrectDescriptionInvoice(invoice)
    : null
}

const getInvoiceUser = async ({ invoiceId }: { invoiceId: string }) => {
  const user = await checkAuthenticated()

  if (!user.customerId) {
    throw new Error('User does not have a customer id')
  }

  const invoice = await stripe.invoices.retrieve(invoiceId).catch(() => null)

  return invoice && invoice.number
    ? ensureCorrectDescriptionInvoice(invoice)
    : null
}
