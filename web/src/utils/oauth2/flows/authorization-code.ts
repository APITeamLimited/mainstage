import {
  OAuth2Token,
  prettyZodError,
  RESTAuth,
  restAuthSchema,
} from '@apiteam/types/src'
import type { ApolloClient } from '@apollo/client/core'

import {
  apiTeamOauth2CallbackURL,
  createAPITeamOAuth2Code,
  fetchToken,
} from '../backend-callbacks'
import { getCallbackResult } from '../method-utils'

export const handleAuthorizationCodeFlow = async (
  inputAuth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'authorization-code' | 'authorization-code-with-pkce'
  },
  apolloClient: ApolloClient<object>,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
): Promise<OAuth2Token> => {
  // Necessary to avoid mutating the inputAuth object and causing a re-render
  const restAuth = { ...inputAuth }

  if (restAuth.state === '') {
    // Set state to a random 20 character string
    restAuth.state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  }

  const apiteamCallbackCode = await createAPITeamOAuth2Code(apolloClient)

  restAuth.redirectURI = `${apiTeamOauth2CallbackURL()}?apiteamCallbackCode=${apiteamCallbackCode}`

  const validationResult = restAuthSchema.safeParse(restAuth)

  if (!validationResult.success) {
    console.error(validationResult.error)
    throw prettyZodError(validationResult.error)
  }

  const authorizationURLWithParams = new URL(restAuth.authorizationURL)

  authorizationURLWithParams.searchParams.append('response_type', 'code')
  authorizationURLWithParams.searchParams.append('client_id', restAuth.clientID)
  authorizationURLWithParams.searchParams.append('state', restAuth.state)
  authorizationURLWithParams.searchParams.append(
    'redirect_uri',
    restAuth.redirectURI
  )

  if (restAuth.scope && restAuth.scope !== '') {
    authorizationURLWithParams.searchParams.append('scope', restAuth.scope)
  }

  if (restAuth.grantType === 'authorization-code-with-pkce') {
    if (restAuth.codeVerifier === '') {
      // Set code verifier to a random 140 character string with A-Z, a-z, 0-9, and
      // the punctuation characters -._~ (hyphen, period, underscore, and tilde)
      restAuth.codeVerifier = generateRandomCodeVerifier()
    }

    authorizationURLWithParams.searchParams.append(
      'code_challenge_method',
      restAuth.codeChallengeMethod
    )
    authorizationURLWithParams.searchParams.append(
      'code_challenge',
      await createCodeChallenge(restAuth)
    )
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

  if (callbackResult.state !== restAuth.state) {
    throw new Error(
      'Incorrect state returned from callback, possible CSRF attack'
    )
  }

  return await fetchToken({
    apolloClient,
    grantType: restAuth.grantType,
    code: callbackResult.code,
    accessTokenURL: restAuth.accessTokenURL,
    clientID: restAuth.clientID,
    clientSecret: restAuth.clientSecret,
    redirectURI: restAuth.redirectURI,
    clientAuthentication: restAuth.clientAuthentication,
    codeVerifier:
      restAuth.grantType === 'authorization-code-with-pkce'
        ? restAuth.codeVerifier
        : undefined,
  })
}

const generateRandomCodeVerifier = () =>
  Array.from(window.crypto.getRandomValues(new Uint8Array(140)))
    .map((n) => n % 64)
    .map((n) => {
      if (n < 26) {
        return String.fromCharCode(n + 65)
      } else if (n < 52) {
        return String.fromCharCode(n + 71)
      } else if (n < 62) {
        return String.fromCharCode(n - 4)
      } else if (n === 62) {
        return '-'
      } else if (n === 63) {
        return '_'
      } else {
        return '~'
      }
    })
    .join('')

const createCodeChallenge = async (
  restAuth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'authorization-code-with-pkce'
  }
) => {
  if (restAuth.codeChallengeMethod === 'plain') {
    return restAuth.codeVerifier
  }

  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(restAuth.codeVerifier)

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // convert bytes to hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
