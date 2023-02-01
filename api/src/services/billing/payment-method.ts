import { ServiceValidationError } from '@redwoodjs/api'
import { getCustomerBillingDetails } from 'src/helpers/billing'
import { CustomerModel, TeamModel, UserModel } from 'src/models'
import {
  PaymentMethodModel,
  AbstractCreatePaymentMethodInput,
} from 'src/models/billing/payment-method'

import { checkOwnerAdmin, checkAuthenticated } from '../guards'

export const paymentMethods = async ({ teamId }: { teamId?: string }) => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  return PaymentMethodModel.getManyFiltered('customer', customerId)
}

export const paymentMethod = async ({
  teamId,
  paymentMethodId,
}: {
  teamId?: string
  paymentMethodId: string
}) => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  const paymentMethod = await PaymentMethodModel.get(paymentMethodId)

  if (!paymentMethod || paymentMethod.customer !== customerId) {
    throw new Error('Payment method not found')
  }

  return paymentMethod
}

export const createPaymentMethod = async ({
  teamId,
  type,
  tokenId,
}: AbstractCreatePaymentMethodInput & {
  teamId?: string
}) => {
  const user = await checkAuthenticated()

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(user.id))

  const customer = await CustomerModel.get(customerId)

  if (!customer) {
    throw new Error('Customer not found')
  }

  return PaymentMethodModel.create({
    type,
    customerId,
    tokenId,
    billingDetails: getCustomerBillingDetails(customer),
  })
}

export const deletePaymentMethod = async ({
  teamId,
  paymentMethodId,
}: {
  teamId?: string
  paymentMethodId: string
}) => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  const paymentMethod = await PaymentMethodModel.get(paymentMethodId)

  if (!paymentMethod || paymentMethod.customer !== customerId) {
    throw new Error('Payment method not found')
  }

  return PaymentMethodModel.delete(paymentMethodId)
}

export const setDefaultPaymentMethod = async ({
  teamId,
  paymentMethodId,
}: {
  teamId?: string
  paymentMethodId: string
}) => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  const paymentMethod = await PaymentMethodModel.get(paymentMethodId)

  if (!paymentMethod || paymentMethod.customer !== customerId) {
    throw new ServiceValidationError(`Payment method with id ${paymentMethodId} not found`)
  }

  await CustomerModel.update(customerId, {
    invoiceSettings: {
      defaultPaymentMethod: paymentMethodId,
    },
  })

  return paymentMethod
}