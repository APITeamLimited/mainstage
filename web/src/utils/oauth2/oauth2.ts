import { OAuth2Token, Auth, authSchema } from '@apiteam/types'
import type { ApolloClient } from '@apollo/client/core'
import type { SafeParseReturnType } from 'zod'

import {
  handleAuthorizationCodeFlow,
  validateAuthorizationCodeFlow,
} from './flows'

export const getOAuth2Token = async (
  validatedAuth: Auth & {
    authType: 'oauth2'
  },
  apiteamCallbackCode: string,
  apolloClient: ApolloClient<object>,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
): Promise<OAuth2Token> => {
  if (
    validatedAuth.grantType === 'authorization-code' ||
    validatedAuth.grantType === 'authorization-code-with-pkce'
  ) {
    return handleAuthorizationCodeFlow(
      validatedAuth,
      apiteamCallbackCode,
      apolloClient,
      abortRef
    )
    // } else if (validatedAuth.grantType === 'implicit') {
    //   return handleImplicitFlow(validatedAuth, apolloClient, abortRef)
    // } else {
  } else {
    throw new Error(`Unsupported grant type: ${validatedAuth.grantType}`)
  }
}

export type OAuth2ValidationResult = {
  apiteamCallbackCode: string
  parseResult: SafeParseReturnType<
    Auth & {
      authType: 'oauth2'
    },
    typeof authSchema
  >
}

export const validateOAuth2Data = (
  auth: Auth & {
    authType: 'oauth2'
  },
  apolloClient: ApolloClient<object>
) => {
  if (
    auth.grantType === 'authorization-code' ||
    auth.grantType === 'authorization-code-with-pkce'
  ) {
    return validateAuthorizationCodeFlow(auth, apolloClient)
  } else {
    throw new Error(`Unsupported grant type: ${auth.grantType}`)
  }
}
