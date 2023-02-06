import {
  ApiteamOAuth2Callback,
  oauth2TokenSchema,
  prettyZodError,
  Auth,
  authSchema,
} from '@apiteam/types/src'
import type { ApolloClient } from '@apollo/client/core'

import {
  apiTeamOauth2CallbackURL,
  createAPITeamOAuth2Code,
} from '../backend-callbacks'
import { getCallbackResult } from '../method-utils'

export const handleImplicitFlow = async (
  inputAuth: Auth & {
    authType: 'oauth2'
    grantType: 'implicit'
  },
  apolloClient: ApolloClient<object>,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
) => {
  // Necessary to avoid mutating the inputAuth object and causing a re-render
  const auth = { ...inputAuth }

  if (auth.state === '') {
    // Set state to a random 20 character string
    auth.state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  }

  const apiteamCallbackCode = await createAPITeamOAuth2Code(apolloClient)

  auth.redirectURI = `${apiTeamOauth2CallbackURL()}?apiteamCallbackCode=${apiteamCallbackCode}`

  const validationResult = authSchema.safeParse(auth)

  if (!validationResult.success) {
    throw prettyZodError(validationResult.error)
  }

  const authorizationURLWithParams = new URL(auth.authorizationURL)

  authorizationURLWithParams.searchParams.append('response_type', 'token')
  authorizationURLWithParams.searchParams.append('client_id', auth.clientID)
  authorizationURLWithParams.searchParams.append('state', auth.state)
  authorizationURLWithParams.searchParams.append(
    'redirect_uri',
    auth.redirectURI
  )

  if (auth.scope && auth.scope !== '') {
    authorizationURLWithParams.searchParams.append('scope', auth.scope)
  }

  // Create a new window and navigate to the authorization URL with the appropriate
  // query parameters
  window.open(
    authorizationURLWithParams.toString(),
    'APITeam OAuth 2.0',
    'width=1000,height=600'
  )

  const callbackResult = await getCallbackResult(
    apolloClient,
    apiteamCallbackCode,
    abortRef
  )

  if (callbackResult.state !== auth.state) {
    throw new Error(
      'Incorrect state returned from callback, possible CSRF attack'
    )
  }

  return extractToken(callbackResult)
}

const extractToken = (callbackResult: ApiteamOAuth2Callback) => {
  const token: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(callbackResult)) {
    if (key !== 'state' && key !== 'code') {
      token[key] = value
    }
  }

  const validationResult = oauth2TokenSchema.safeParse(token)

  if (!validationResult.success) {
    throw prettyZodError(validationResult.error)
  }

  return validationResult.data
}
