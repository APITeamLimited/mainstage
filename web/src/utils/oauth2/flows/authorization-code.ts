import { OAuth2Token, RESTAuth, restAuthOAuth2Schema } from '@apiteam/types/src'
import type { ApolloClient } from '@apollo/client/core'

import {
  apiTeamOauth2CallbackURL,
  createAPITeamOAuth2Code,
  fetchToken,
} from '../backend-callbacks'
import { getCallbackResult } from '../method-utils'

export const validateAuthorizationCodeFlow = async (
  inputAuth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'authorization-code' | 'authorization-code-with-pkce'
  },
  apolloClient: ApolloClient<object>
) => {
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

  return {
    apiteamCallbackCode,
    parseResult: restAuthOAuth2Schema.safeParse(restAuth),
  }
}

export const handleAuthorizationCodeFlow = async (
  validatedAuth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'authorization-code' | 'authorization-code-with-pkce'
  },
  apiteamCallbackCode: string,
  apolloClient: ApolloClient<object>,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
): Promise<OAuth2Token> => {
  const authorizationURLWithParams = new URL(validatedAuth.authorizationURL)

  authorizationURLWithParams.searchParams.append('response_type', 'code')
  authorizationURLWithParams.searchParams.append(
    'client_id',
    validatedAuth.clientID
  )
  authorizationURLWithParams.searchParams.append('state', validatedAuth.state)
  authorizationURLWithParams.searchParams.append(
    'redirect_uri',
    validatedAuth.redirectURI
  )

  if (validatedAuth.scope && validatedAuth.scope !== '') {
    authorizationURLWithParams.searchParams.append('scope', validatedAuth.scope)
  }

  if (validatedAuth.grantType === 'authorization-code-with-pkce') {
    if (validatedAuth.codeVerifier === '') {
      // Set code verifier to a random 140 character string with A-Z, a-z, 0-9, and
      // the punctuation characters -._~ (hyphen, period, underscore, and tilde)
      validatedAuth.codeVerifier = generateRandomCodeVerifier()
    }

    authorizationURLWithParams.searchParams.append(
      'code_challenge_method',
      validatedAuth.codeChallengeMethod
    )
    authorizationURLWithParams.searchParams.append(
      'code_challenge',
      await createCodeChallenge(validatedAuth)
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

  if (callbackResult.state !== validatedAuth.state) {
    throw new Error(
      'Incorrect state returned from callback, possible CSRF attack'
    )
  }

  return await fetchToken({
    apolloClient,
    grantType: validatedAuth.grantType,
    code: callbackResult.code,
    accessTokenURL: validatedAuth.accessTokenURL,
    clientID: validatedAuth.clientID,
    clientSecret: validatedAuth.clientSecret,
    redirectURI: validatedAuth.redirectURI,
    clientAuthentication: validatedAuth.clientAuthentication,
    codeVerifier:
      validatedAuth.grantType === 'authorization-code-with-pkce'
        ? validatedAuth.codeVerifier
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
