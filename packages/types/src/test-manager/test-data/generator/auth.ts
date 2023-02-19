import type { AxiosRequestConfig } from 'axios'
import type { Map as YMap } from 'yjs'

import type { Auth, OAuth2Token, WrappedOAuth2Token } from '../../../entities'
import type { ExecutionParams } from '../../../execution-params'

import { findEnvironmentVariables } from './variables'

export const addAuthToAxiosConfig = async (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  collectionYMap: YMap<any>,
  currentNode: YMap<any>,
  folders: YMap<any>,
  axiosConfig: AxiosRequestConfig
): Promise<AxiosRequestConfig> => {
  const authOriginal = currentNode.get('auth') as Auth

  // Make a copy of auth so we don't mutate the original
  const auth = JSON.parse(JSON.stringify(authOriginal)) as Auth

  if (auth.authType === 'inherit') {
    if (currentNode.get('__typename') === 'Collection') {
      throw new Error('Inherit auth type not allowed on collectionYMap')
    }

    const parentFolder = (Array.from(folders.values()) as YMap<any>[]).find(
      (folder) => folder.get('id') === currentNode.get('parentId')
    )

    if (parentFolder) {
      return await addAuthToAxiosConfig(
        environmentContext,
        collectionContext,
        collectionYMap,
        parentFolder,
        folders,
        axiosConfig
      )
    }

    if (collectionYMap.get('id') === currentNode.get('parentId')) {
      return await addAuthToAxiosConfig(
        environmentContext,
        collectionContext,
        collectionYMap,
        collectionYMap,
        folders,
        axiosConfig
      )
    }

    throw new Error('Could not find parent of RESTRequest')
  } else if (auth.authType === 'none') {
    return axiosConfig
  } else if (auth.authType === 'basic') {
    return {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Basic ${btoa(`${auth.username}:${auth.password}`)}`,
      },
    }
  } else if (auth.authType === 'bearer') {
    return {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Bearer ${await findEnvironmentVariables(
          environmentContext,
          collectionContext,
          auth.token
        )}`,
      },
    }
  } else if (auth.authType === 'api-key') {
    if (auth.addTo === 'header') {
      return {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          [await findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.key
          )]: await findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.value
          ),
        },
      }
    } else if (auth.addTo === 'query') {
      return {
        ...axiosConfig,
        params: {
          ...axiosConfig.params,
          [await findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.key
          )]: await findEnvironmentVariables(
            environmentContext,
            collectionContext,
            auth.value
          ),
        },
      }
    } else {
      throw new Error(`auth.addTo === "${auth.addTo}" invalid`)
    }
  } else if (auth.authType === 'oauth2') {
    if (auth.existingAccessTokens.length === 0) {
      throw new Error('No OAuth2 tokens found, generate one first in the UI')
    }

    const oauthLocalSaveKey = currentNode.get('id')

    // Check if nodeJS or browser
    const isBrowser = typeof window !== 'undefined'

    const activeWrappedTokenRaw = isBrowser
      ? localStorage.getItem(`apiteam:oauth2:${oauthLocalSaveKey}:active`)
      : null

    const activeWrappedToken = activeWrappedTokenRaw
      ? (JSON.parse(activeWrappedTokenRaw) as WrappedOAuth2Token)
      : null

    let needFindToken = true

    if (activeWrappedToken) {
      // Ensure token is in auth
      const tokenExistsInAuth = (auth.existingAccessTokens =
        auth.existingAccessTokens.filter(
          (wrappedToken) =>
            wrappedToken.token.access_token !==
            activeWrappedToken.token.access_token
        ))

      if (tokenExistsInAuth) {
        needFindToken = false
      }
    }

    let token: OAuth2Token | null = null

    if (!needFindToken && activeWrappedToken) {
      token = activeWrappedToken.token
    } else {
      // Find newest token
      const newestToken = auth.existingAccessTokens.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]

      token = newestToken.token
    }

    if (!token) {
      throw new Error('No OAuth2 tokens found, generate one first in the UI')
    }

    // Check if token is expired
    if (token.expires_at && new Date(token.expires_in).getTime() < Date.now()) {
      // Throw error
      throw new Error('OAuth2 token expired, generate a new one in the UI')
    }

    // Add token to header
    return {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  }

  // Never reached
  throw new Error('Invalid auth type')
}
