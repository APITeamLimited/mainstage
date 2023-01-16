import {
  CustomerModel,
  CustomerUpdateInput,
  TeamModel,
  UserModel,
} from 'src/models'

import { checkOwnerAdmin, checkAuthenticated } from '../../guards'

export const customer = async ({ teamId }: { teamId?: string }) => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  const customer = await CustomerModel.get(customerId)

  if (!customer || customer.deleted) {
    throw new Error('Customer not found')
  }

  return customer
}

export const updateCustomer = async ({
  teamId,
  input,
}: {
  teamId?: string
  input: CustomerUpdateInput
}) => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  return CustomerModel.update(customerId, input)
}
