import { ReactNode } from 'react'

import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import { activeWorkspaceVar } from './reactives'

export const CustomApolloProvider = ({
  children,
}: {
  children?: ReactNode
}) => {
  return (
    <RedwoodApolloProvider
      graphQLClientConfig={{
        cacheConfig: {
          typePolicies: {
            Query: {
              fields: {
                activeWorkspace: {
                  read() {
                    return activeWorkspaceVar
                  },
                },
              },
            },
          },
        },
      }}
    >
      {children}
    </RedwoodApolloProvider>
  )
}
