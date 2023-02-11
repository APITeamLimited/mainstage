import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'
import fetch from 'cross-fetch'

import { checkValue } from '../config'

const host = checkValue<string>('api.host')
const port = checkValue<number>('api.port')
const gqlEndpoint = checkValue<string>('api.gqlEndpoint')

const API_GRAPHQL_ENDPOINT = `http://${host}:${port}${gqlEndpoint}`

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: `${API_GRAPHQL_ENDPOINT}`,
    fetch,
    credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
  }),
  // Disable cache in default options
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})
