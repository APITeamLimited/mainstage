import { OAuth2Token, RESTAuth } from '@apiteam/types/src'
import type { ApolloClient } from '@apollo/client/core'

import { snackErrorMessageVar } from 'src/components/app/dialogs'

import { handleImplicitFlow, handleAuthorizationCodeFlow } from './flows'

export const getOAuth2Token = async (
  restAuth: RESTAuth & {
    authType: 'oauth2'
  },
  apolloClient: ApolloClient<object>,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
) => {
  try {
    return await getOAuth2TokenRaw(restAuth, apolloClient, abortRef)
  } catch (error) {
    snackErrorMessageVar((error as { message: string }).message)
    return null
  }
}

export const getOAuth2TokenRaw = async (
  restAuth: RESTAuth & {
    authType: 'oauth2'
  },
  apolloClient: ApolloClient<object>,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
): Promise<OAuth2Token> => {
  if (
    restAuth.grantType === 'authorization-code' ||
    restAuth.grantType === 'authorization-code-with-pkce'
  ) {
    return handleAuthorizationCodeFlow(restAuth, apolloClient, abortRef)
  } else if (restAuth.grantType === 'implicit') {
    return handleImplicitFlow(restAuth, apolloClient, abortRef)
  } else {
    throw new Error(`Unsupported grant type: ${restAuth.grantType}`)
  }
}
