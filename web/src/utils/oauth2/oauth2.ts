import { OAuth2Token, RESTAuth, restAuthSchema } from '@apiteam/types/src'
import type { ApolloClient } from '@apollo/client/core'
import type { SafeParseReturnType } from 'zod'

import {
  handleAuthorizationCodeFlow,
  validateAuthorizationCodeFlow,
} from './flows'

export const getOAuth2Token = async (
  validatedAuth: RESTAuth & {
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
    RESTAuth & {
      authType: 'oauth2'
    },
    typeof restAuthSchema
  >
}

export const validateOAuth2Data = (
  restAuth: RESTAuth & {
    authType: 'oauth2'
  },
  apolloClient: ApolloClient<object>
) => {
  if (
    restAuth.grantType === 'authorization-code' ||
    restAuth.grantType === 'authorization-code-with-pkce'
  ) {
    return validateAuthorizationCodeFlow(restAuth, apolloClient)
  } else {
    throw new Error(`Unsupported grant type: ${restAuth.grantType}`)
  }
}
