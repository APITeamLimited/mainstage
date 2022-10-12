import { useState } from 'react'

import { useApolloClient, ApolloClient } from '@apollo/client'
import { useTheme } from '@mui/material'
import { Admin, Resource } from 'react-admin'

import { admins, DataProviderInstance, ValidAdmin } from './data-provider'
import { AdminLayout } from './Layout/AdminLayout'

export const ReactAdmin = () => {
  const apollo = useApolloClient() as ApolloClient<unknown>
  const [dataProvider] = useState<DataProviderInstance>(
    new DataProviderInstance(apollo)
  )
  const theme = useTheme()

  return (
    <Admin theme={theme} dataProvider={dataProvider} layout={AdminLayout}>
      {admins.map((admin, index) => {
        return (
          <Resource
            name={admin.gqlName}
            key={index}
            list={admin.admins.list}
            show={admin.admins.show}
            options={{
              label: admin.displayNamePlural,
            }}
          />
        )
      })}
    </Admin>
  )
}
