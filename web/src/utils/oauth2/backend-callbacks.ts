import {
  ApiteamOAuth2Callback,
  OAuth2Token,
  oauth2TokenSchema,
  prettyZodError,
} from '@apiteam/types'
import type { ApolloClient } from '@apollo/client/core'

const CREATE_API_TEAM_OAUTH2_CODE = gql`
  mutation CreateAPITeamOAuth2Code {
    createAPITeamOAuth2Code
  }
`

export const createAPITeamOAuth2Code = async (
  apolloClient: ApolloClient<object>
) => {
  const result = await apolloClient.mutate<{
    createAPITeamOAuth2Code: string
  }>({
    mutation: CREATE_API_TEAM_OAUTH2_CODE,
  })

  if (result.errors || !result.data) {
    throw new Error('Failed to create APITeam OAuth2 callback code')
  }

  return result.data.createAPITeamOAuth2Code
}

const GET_API_TEAM_OAUTH2_RESULT = gql`
  query GetAPITeamOAuth2Result($apiteamOAuth2Code: String!) {
    apiTeamOAuth2Result(apiteamOAuth2Code: $apiteamOAuth2Code)
  }
`

export const getAPITeamOAuth2Result = async (
  apiteamOAuth2Code: string,
  apolloClient: ApolloClient<object>
) => {
  const result = await apolloClient.query<
    {
      apiTeamOAuth2Result: string | null
    },
    {
      apiteamOAuth2Code: string
    }
  >({
    query: GET_API_TEAM_OAUTH2_RESULT,
    variables: {
      apiteamOAuth2Code,
    },
  })

  if (result.error) {
    throw new Error('Failed to get APITeam OAuth2 callback result')
  }

  return !result.data.apiTeamOAuth2Result
    ? null
    : (JSON.parse(result.data.apiTeamOAuth2Result) as ApiteamOAuth2Callback)
}

export const apiTeamOauth2CallbackURL = () =>
  `${window.location.origin}/api/oauth2-callback`

export const FETCH_TOKEN_QUERY = gql`
  query FetchAccessToken(
    $grantType: String!
    $code: String!
    $accessTokenURL: String!
    $clientID: String!
    $clientSecret: String!
    $redirectURI: String!
    $codeVerifier: String
    $clientAuthentication: String!
  ) {
    fetchToken(
      grantType: $grantType
      code: $code
      accessTokenURL: $accessTokenURL
      clientID: $clientID
      clientSecret: $clientSecret
      redirectURI: $redirectURI
      codeVerifier: $codeVerifier
      clientAuthentication: $clientAuthentication
    )
  }
`

type FetchTokenBaseArgs = {
  grantType: string
  code: string
  accessTokenURL: string
  clientID: string
  clientSecret: string
  redirectURI: string
  codeVerifier?: string
  clientAuthentication: 'header' | 'body'
}

export const fetchToken = async ({
  apolloClient,
  grantType,
  code,
  accessTokenURL,
  clientID,
  clientSecret,
  redirectURI,
  codeVerifier,
  clientAuthentication,
}: {
  apolloClient: ApolloClient<object>
} & FetchTokenBaseArgs): Promise<OAuth2Token> => {
  const result = await apolloClient.query<
    {
      fetchToken: string
    },
    FetchTokenBaseArgs
  >({
    query: FETCH_TOKEN_QUERY,
    variables: {
      grantType,
      code,
      accessTokenURL,
      clientID,
      clientSecret,
      redirectURI,
      codeVerifier,
      clientAuthentication,
    },
  })

  if (result.errors || !result.data.fetchToken) {
    console.error(result.errors, result.data)
    throw new Error('Failed to fetch access token')
  }

  const rawData = JSON.parse(result.data.fetchToken)

  const tokenValidation = oauth2TokenSchema.safeParse(rawData)

  if (!tokenValidation.success) {
    throw prettyZodError(tokenValidation.error)
  }

  return tokenValidation.data
}
