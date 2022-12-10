import axios from 'axios'

import { ServiceValidationError } from '@redwoodjs/api'

export const fetchToken = async ({
  grantType,
  code,
  accessTokenURL,
  clientID,
  clientSecret,
  redirectURI,
  codeVerifier,
  clientAuthentication,
}: {
  grantType: string
  code: string
  accessTokenURL: string
  clientID: string
  clientSecret: string
  redirectURI: string
  codeVerifier?: string
  clientAuthentication: string
}): Promise<string> => {
  if (!context.currentUser) {
    throw new ServiceValidationError('Not logged in')
  }

  if (clientAuthentication !== 'header' && clientAuthentication !== 'body') {
    throw new ServiceValidationError(
      `Invalid client authentication: ${clientAuthentication}`
    )
  }

  const authHeaders: Record<string, string> =
    clientAuthentication === 'header'
      ? {
          Authorization: `Basic ${Buffer.from(
            `${clientID}:${clientSecret}`
          ).toString('base64')}`,
        }
      : {}

  const body: Record<string, string> = {
    grant_type: getCorrectGrantType(grantType),
    client_id: clientID,
    client_secret: clientSecret,
    redirect_uri: redirectURI,
    code,
  }

  if (codeVerifier) {
    body['code_verifier'] = codeVerifier
  }

  if (clientAuthentication === 'body') {
    body['client_id'] = clientID
    body['client_secret'] = clientSecret
  }

  const reponse = await axios({
    method: 'POST',
    url: accessTokenURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
      ...authHeaders,
    },
    data: new URLSearchParams(body).toString(),
  }).catch((error) => {
    throw new ServiceValidationError(error)
  })

  if (reponse.status !== 200 && reponse.status !== 201) {
    throw new ServiceValidationError(
      `Error getting access token: ${reponse.status} ${reponse.statusText}`
    )
  }

  return JSON.stringify(reponse.data)
}

const getCorrectGrantType = (grantType: string) => {
  if (
    grantType === 'authorization-code' ||
    grantType === 'authorization-code-with-pkce'
  ) {
    return 'authorization_code'
  }

  return grantType
}
