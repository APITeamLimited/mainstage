import {
  apiteamOAuth2CallbackSchema,
  APITeamOAuthCodeInfo,
  prettyZodError,
} from '@apiteam/types-commonjs'
import type { APIGatewayProxyEvent } from 'aws-lambda'

import { getCoreCacheReadRedis } from '../lib/redis'

type OAuthReturnResult = {
  statusCode: number
  body: string
  headers?: Record<string, string>
}
export const handler = async (
  event: APIGatewayProxyEvent,
  _: never
): Promise<OAuthReturnResult> => {
  const apiteamCallbackCode = getAPITeamCallbackCode(event)

  if (apiteamCallbackCode === null) {
    return {
      statusCode: 400,
      body: 'apiteamCallbackCode must be provided in query parameters',
    }
  }

  // Check if the code is valid
  const parseResult = apiteamOAuth2CallbackSchema.safeParse(
    event.queryStringParameters
  )

  if (!parseResult.success) {
    return {
      statusCode: 400,
      body: prettyZodError(parseResult.error).message,
    }
  }

  const coreCacheReadRedis = await getCoreCacheReadRedis()

  const rawData = await coreCacheReadRedis.get(
    `oauth2-callback:${apiteamCallbackCode}`
  )

  if (!rawData) {
    return {
      statusCode: 400,
      body: 'Invalid apiteamCallbackCode',
    }
  }

  const data = JSON.parse(rawData) as APITeamOAuthCodeInfo

  if (data.returnResult) {
    return {
      statusCode: 400,
      body: 'Already used that oauth2-callback',
    }
  }

  // Remove apiteamCallbackCode from parseResult.data
  delete parseResult.data.apiteamCallbackCode

  await coreCacheReadRedis.set(
    `oauth2-callback:${apiteamCallbackCode}`,
    JSON.stringify({
      ...data,
      returnResult: parseResult.data,
    })
  )
  await coreCacheReadRedis.expire(`oauth2-callback:${apiteamCallbackCode}`, 60)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `<!DOCTYPE html>
    <html>
      <head>
        <title>APITeam OAuth 2 Callback</title>
        <script>
          window.close()
        </script>
      </head>
      <body>
        Success! You can close this window.
      </body>
    </html>
    `,
  }
}

const getAPITeamCallbackCode = (event: APIGatewayProxyEvent): string | null =>
  event.queryStringParameters?.apiteamCallbackCode ?? null
