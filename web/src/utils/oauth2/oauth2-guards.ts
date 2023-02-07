import { Auth } from '@apiteam/types/src'

export const guardOAuth2Save = (auth: Auth, oauthLocalSaveKey: string) => {
  if (auth.authType !== 'oauth2') {
    return auth
  }

  localStorage.setItem(
    `apiteam:oauth2:${oauthLocalSaveKey}:auths`,
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
