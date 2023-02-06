import { Auth, WrappedOAuth2Token } from '@apiteam/types/src'

export const guardOAuth2Save = (auth: Auth, activeId: string) => {
  if (auth.authType !== 'oauth2') {
    return auth
  }

  localStorage.setItem(
    `apiteam:oauth2:${activeId}:auths`,
    JSON.stringify(
      auth.existingAccessTokens.filter((token) => token.syncType === 'local')
    )
  )

  return {
    ...auth,
    existingAccessTokens: auth.existingAccessTokens.filter(
      (token) => token.syncType === 'workspace'
    ),
  }
}

export const oauth2LoadLocal = (auth: Auth, activeId: string): Auth => {
  if (auth.authType !== 'oauth2') {
    return auth
  }

  const localAuthsRaw = localStorage.getItem(`apiteam:oauth2:${activeId}:auths`)

  const localAuths = localAuthsRaw
    ? (JSON.parse(localAuthsRaw) as WrappedOAuth2Token[])
    : []

  // Prevent feedback loop by mutating the original object, else unwanted re-renders as this is just the initial load
  // Ensure no duplicates
  auth.existingAccessTokens = auth.existingAccessTokens.concat(
    localAuths.filter(
      (localAuth) =>
        !auth.existingAccessTokens.find(
          (token) => token.token.access_token === localAuth.token.access_token
        )
    )
  )

  return auth
}
