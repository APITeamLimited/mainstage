import { gql } from '@apollo/client'

import { Scope } from '../../../api/types/graphql'
import { apolloClient } from '../apollo'

/*const subscribeRedis = scopesReadRedis.duplicate()

subscribeRedis.on('error', (err) => {
  console.log(err)
})
*/

export const findScope = async (id: string): Promise<Scope | null> => {
  return (await _findScopeRedis(id)) || (await _findScopeBackend(id))
}

const _findScopeRedis = async (id: string): Promise<Scope | null> => {
  // For dev
  return null
  //try {
  //  const scopeRaw = JSON.parse((await scopesReadRedis.get(id)) || 'null')
  //
  //  if (isScope(scopeRaw)) {
  //    return scopeRaw
  //  }
  //  return null
  //} catch (error) {
  //  console.log('Failed to get scope from redis', error)
  //  return null
  //}
}

const scopeQuery = gql`
  query InternalScope($id: String!) {
    internalScope(id: $id) {
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

  if (result.data) {
    if (isScope(result.data?.internalScope)) {
      const scope = result.data.internalScope as Scope
      // For dev
      //scopesReadRedis.set(scope.id, JSON.stringify(scope))
      return scope
    }
  }
  return null
}

/***
 * Provides updated scope data via a callback
 */
/*export const subscribeToScope = async (
  scopeId: string,
  onChange: (newScope: Scope | null) => void
) => {
  await subscribeRedis.connect()
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
}*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isScope = (scope: any): scope is Scope => {
  return scope?.__typename === 'Scope'
}
