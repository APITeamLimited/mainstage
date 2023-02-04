import { useCallback, useEffect, useState } from 'react'

import { RESTAuth, WrappedOAuth2Token } from '@apiteam/types/src'

export const useActiveWrappedToken = (
  activeId: string,
  auth: RESTAuth & {
    authType: 'oauth2'
  }
) => {
  const handleCheck = useCallback(() => {
    const activeWrappedToken = localStorage.getItem(
      `apiteam:oauth2:${activeId}:active`
    )

    if (activeWrappedToken) {
      const wrappedToken = JSON.parse(activeWrappedToken) as WrappedOAuth2Token
      // Check if the token is still in the list of existing tokens
      if (
        auth.existingAccessTokens.find(
          (token) =>
            token.token.access_token === wrappedToken.token.access_token
        )
      ) {
        return JSON.parse(activeWrappedToken) as WrappedOAuth2Token
      }
    }

    // If there is no active token, but an existing token, set the newest one as active

    if (auth.existingAccessTokens.length > 0) {
      const newestToken = auth.existingAccessTokens.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]

      localStorage.setItem(
        `apiteam:oauth2:${activeId}:active`,
        JSON.stringify(newestToken)
      )

      return newestToken
    }

    return null
  }, [activeId, auth.existingAccessTokens])

  const [activeWrappedToken, setActiveWrappedToken] =
    useState<WrappedOAuth2Token | null>(null)

  useEffect(() => {
    setActiveWrappedToken(handleCheck())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.existingAccessTokens])

  return activeWrappedToken
}
