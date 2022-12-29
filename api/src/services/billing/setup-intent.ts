import { ServiceValidationError } from '@redwoodjs/api'

import { TeamModel, UserModel } from 'src/models/'
import { SetupIntentModel } from 'src/models/billing/setup-intent'

import { checkAuthenticated, checkOwnerAdmin } from '../guards'

type SetupIntentResponse = {
  setupIntentId?: string
  redirectUri?: string
}

export const createSetupIntent = async ({
  teamId,
}: {
  teamId: string
}): Promise<SetupIntentResponse> => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const team = teamId ? await TeamModel.get(teamId) : null

  if (teamId && !team) {
    throw new ServiceValidationError(`Team with id ${teamId} not found`)
  }

  const customerId = await (teamId
    ? TeamModel.getOrCreateCustomerId(teamId)
    : UserModel.getOrCreateCustomerId(userId))

  const setupIntent = await SetupIntentModel.create({ customerId })

  // Check for redirect status
  if (
    !setupIntent.next_action ||
    !setupIntent.next_action.redirect_to_url ||
    !setupIntent.next_action.redirect_to_url.url
  ) {
    return {
      setupIntentId: setupIntent.id,
    }
  }

  return {
    setupIntentId: setupIntent.id,
    redirectUri: setupIntent.next_action.redirect_to_url.url,
  }
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

  const team = teamId ? await TeamModel.get(teamId) : null

  if (teamId && !team) {
    throw new ServiceValidationError(`Team with id ${teamId} not found`)
  }

  // Ensure customer id matches the one on the setup intent
  const setupIntent = await SetupIntentModel.get(setupIntentId).catch(
    () => null
  )
  const customerId = team ? team.customerId : user.customerId

  if (setupIntent === null || setupIntent.customer !== customerId) {
    throw new ServiceValidationError(
      `SetupIntent with id ${setupIntentId} not found on customer profile`
    )
  }

  await SetupIntentModel.delete(setupIntentId)

  return true
}

export const setupIntents = async ({ teamId }: { teamId?: string }) => {
  const user = await checkAuthenticated()

  if (teamId) {
    await checkOwnerAdmin({ teamId })
  }

  const team = teamId ? await TeamModel.get(teamId) : null

  if (teamId && !team) {
    throw new ServiceValidationError(`Team with id ${teamId} not found`)
  }

  const customerId = team ? team.customerId : user.customerId

  return SetupIntentModel.getManyFiltered('customer', customerId)
}
