import type Stripe from 'stripe'

import { ServiceValidationError } from '@redwoodjs/api'

import { PaymentMethodModel } from 'src/models/billing/payment-method'
import { SetupIntentModel } from 'src/models/billing/setup-intent'
import { TeamModel } from 'src/models/team'
import { UserModel } from 'src/models/user'

import { checkAuthenticated, checkOwnerAdmin } from '../guards'

export const setupIntents = async ({ teamId }: { teamId?: string }) => {
  const user = await checkAuthenticated()

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(user.id))

  return SetupIntentModel.getManyFiltered('customer', customerId)
}

export const setupIntent = async ({
  teamId,
  setupIntentId,
}: {
  teamId?: string
  setupIntentId: string
}) => {
  const user = await checkAuthenticated()

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(user.id))

  const setupIntent = await SetupIntentModel.get(setupIntentId)

  if (!setupIntent || setupIntent.customer !== customerId) {
    throw new ServiceValidationError(
      `SetupIntent with id ${setupIntentId} not found on customer profile`
    )
  }

  return setupIntent
}

export const createOrUpdateSetupIntent = async ({
  teamId,
  paymentMethodId,
}: {
  teamId: string
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
    throw new ServiceValidationError(
      `PaymentMethod with id ${paymentMethodId} not found on customer profile`
    )
  }

  const existingSetupIntent = await SetupIntentModel.getIndexedField(
    'payment_method',
    paymentMethodId
  )

  const setupIntent =
    existingSetupIntent ??
    (await SetupIntentModel.create({ customerId, paymentMethodId }))

  return {
    id: setupIntent.id,
    status: setupIntent.status,
    client_secret: setupIntent.client_secret,
    redirect_uri: getRedirectURI(setupIntent),
  }
}

const getRedirectURI = (setupIntent: Stripe.SetupIntent) => {
  if (setupIntent.status === 'requires_action') {
    if (setupIntent.next_action?.type === 'use_stripe_sdk') {
      return setupIntent.next_action?.use_stripe_sdk?.stripe_js
    }
  }

  return null
}

export const deleteSetupIntent = async ({
  teamId,
  setupIntentId,
}: {
  teamId?: string
  setupIntentId: string
}): Promise<boolean> => {
  const user = await checkAuthenticated()

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(user.id))

  // Ensure customer id matches the one on the setup intent

  const setupIntent = await SetupIntentModel.get(setupIntentId).catch(
    () => null
  )

  if (setupIntent === null || setupIntent.customer !== customerId) {
    throw new ServiceValidationError(
      `SetupIntent with id ${setupIntentId} not found on customer profile`
    )
  }

  await SetupIntentModel.delete(setupIntentId)

  return true
}
