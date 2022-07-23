import { ApolloQueryResult } from '@apollo/client'
import { createClient } from 'redis'

import { Scope } from '../../../api/types/graphql'
import { apolloClient } from '../apollo'

const host = 'localhost'
const port = 8912
const username = 'admin'
const password = 'admin'

const readRedis = createClient({
  url: `redis://${username}:${password}@${host}:${port}`,
})

readRedis.on('error', (err) => {
  console.log(err)
})

const subscribeRedis = readRedis.duplicate()

subscribeRedis.on('error', (err) => {
  console.log(err)
})

export const findScope = async (id: string): Promise<Scope | null> => {
  return (await _findScopeRedis(id)) || (await _findScopeBackend(id))
}

const _findScopeRedis = async (id: string): Promise<Scope | null> => {
  const scopeRaw = JSON.parse((await readRedis.get(id)) || '').catch(() => null)
  if (isScope(scopeRaw)) {
    return scopeRaw
  }
  return null
}

const scopeQuery = gql`
  query Scope($id: ID!) {
    scope(id: $id) {
      id
      variant
      variantTargetId
      createdAt
      updatedAt
      userId
    }
  }
`

const _findScopeBackend = async (id: string): Promise<Scope | null> => {
  const result = await apolloClient.query({
    query: scopeQuery,
    variables: { id },
  })

  // Check if the result is a scope
  if (!result.error && !result.errors && isScope(result.data)) {
    return result.data
  }
  return null
}

/***
 * Provides updated scope data via a callback
 */
export const subscribeToScope = async (
  scopeId: string,
  onChange: (newScope: Scope | null) => void
) => {
  await subscribeRedis.subscribe(scopeId, (message) => {
    try {
      const parsedMessage = JSON.parse(message)

      const type = parsedMessage?.type

      if (type === 'delete') {
        onChange(null)
      } else if (type === 'update') {
        const parsedScope = parsedMessage.data

        if (isScope(parsedScope)) {
          onChange(parsedScope)
        } else {
          console.log(
            `Invalid scope: ${parsedMessage} received in subscription`
          )
        }
      } else {
        console.log(`Invalid message type: ${type} received in subscription`)
      }
    } catch (err) {
      console.log(err)
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isScope = (scope: any): scope is Scope => {
  return scope?.__typename === 'Scope'
}
