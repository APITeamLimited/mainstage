import { ApiteamOAuth2Callback } from '@apiteam/types'
import type { ApolloClient } from '@apollo/client/core'

import { getAPITeamOAuth2Result } from './backend-callbacks'

export const getCallbackResult = async (
  apolloClient: ApolloClient<object>,
  apiteamCallbackCode: string,
  abortRef?: React.MutableRefObject<null | 'run' | 'abort'>
): Promise<ApiteamOAuth2Callback> => {
  if (abortRef && abortRef.current === 'abort') {
    throw new Error('Aborted OAuth 2.0 Authentication')
  }

  const callbackResult = await getAPITeamOAuth2Result(
    apiteamCallbackCode,
    apolloClient
  )

  if (callbackResult === null) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return getCallbackResult(apolloClient, apiteamCallbackCode)
  }

  return callbackResult
}
