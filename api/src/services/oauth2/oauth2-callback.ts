import { APITeamOAuthCodeInfo } from '@apiteam/types-commonjs'
import { v4 as uuid } from 'uuid'

import { ServiceValidationError } from '@redwoodjs/api'

import { getCoreCacheReadRedis } from '../../lib/redis'

export const createAPITeamOAuth2Code = async (): Promise<string> => {
  if (!context.currentUser) {
    throw new ServiceValidationError('Not logged in')
  }

  const data = {
    userID: context.currentUser.id,
    apiteamOAuth2Code: uuid(),
    returnResult: null,
  }

  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await coreCacheReadRedis.set(
    `oauth2-callback:${data.apiteamOAuth2Code}`,
    JSON.stringify(data)
  )

  await coreCacheReadRedis.expire(
    `oauth2-callback:${data.apiteamOAuth2Code}`,
    60 * 5
  )

  return data.apiteamOAuth2Code
}

export const apiTeamOAuth2Result = async ({
  apiteamOAuth2Code,
}: {
  apiteamOAuth2Code: string
}): Promise<string | null> => {
  if (!context.currentUser) {
    throw new ServiceValidationError('Not logged in')
  }

  const rawData = await (
    await getCoreCacheReadRedis()
  ).get(`oauth2-callback:${apiteamOAuth2Code}`)

  if (!rawData) {
    throw new ServiceValidationError(
      'Invalid apiteamOAuth2Code, it may have expired'
    )
  }

  const data = JSON.parse(rawData) as APITeamOAuthCodeInfo

  if (data.userID !== context.currentUser.id) {
    // Hide fact that the code exists
    throw new ServiceValidationError(
      'Invalid apiteamOAuth2Code, it may have expired'
    )
  }

  return data.returnResult ? JSON.stringify(data.returnResult) : null
}
