import { ComponentType, ReactElement, useState } from 'react'
import { useApolloClient, ApolloClient } from '@apollo/client'
import { Admin, Resource } from 'react-admin'
import { DocumentNode } from 'graphql'
import { UserAdmin } from './users'
import { AdminLayout } from './Layout/AdminLayout'
import { useSettings } from 'src/hooks/use-settings'
import { ThemeProvider, useTheme } from '@mui/material'
import getTheme from 'src/theme'

export type ValidAdmin = {
  gqlName: string
  displayName: string
  displayNamePlural: string
  methods: {
    getList: DocumentNode
    getOne: DocumentNode
    getMany: DocumentNode
    getManyReference: DocumentNode
    //create: DocumentNode
    //update: DocumentNode
    //updateMany: DocumentNode
    //delete: DocumentNode
    //deleteMany: DocumentNode
  }
  methodNames: {
    getList: string
    getOne: string
    getMany: string
    getManyReference: string
    //create: string
    //update: string
    //updateMany: string
    //delete: string
    //deleteMany: string
  }
  admins: {
    show: ComponentType<any> | ReactElement
    list: ComponentType<any> | ReactElement
  }
}

const admins: Array<ValidAdmin> = [UserAdmin]

class DataProviderInstance {
  apollo: ApolloClient<unknown>

  constructor(apollo: ApolloClient<unknown>) {
    this.apollo = apollo
  }

  private getAdmin(resource: string) {
    const admin = admins.find((admin) => admin.gqlName === resource)
    if (!admin) {
      throw new Error(`Resource ${resource} not found in admins`)
    }
    return admin
  }

  async getList(
    resource: string,
    params: {
      pagination?: {
        page?: number
        perPage?: number
      }
      sort?: {
        field: string
        order: 'ASC' | 'DESC'
      }
      filter?: any
    }
  ) {
    const admin = this.getAdmin(resource)

    console.log('getList', resource, params)

    return (
      await this.apollo.query({
        query: admin.methods.getList,
        variables: {
          page: params.pagination?.page,
          perPage: params.pagination?.perPage,
        },
      })
    ).data[admin.methodNames.getList]
  }

  getOne(resource: string, params: { id: string }) {
    const admin = this.getAdmin(resource)

    return this.apollo.query({
      query: admin.methods.getOne,
      variables: {
        id: params.id,
      },
    })
  }

  getMany(resource: string, params: { ids: Array<string> }) {
    const admin = this.getAdmin(resource)

    return this.apollo.query({
      query: admin.methods.getMany,
      variables: params,
    })
  }

  getManyReference(
    resource: string,
    params: {
      target: string
      id: string
      pagination?: {
        page?: number
        perPage?: number
      }
      sort?: {
        field: string
        order: 'ASC' | 'DESC'
      }
      filter?: any
    }
  ) {
    const admin = this.getAdmin(resource)

    return this.apollo.query({
      query: admin.methods.getManyReference,
      variables: params,
    })
  }

  create(resource: string, params: { data: any }) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.create,
      variables: params,
    })
  }

  update(
    resource: string,
    params: { id: string; data: any; previousData?: any }
  ) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.update,
      variables: params,
    })
  }

  updateMany(resource: string, params: { ids: Array<string>; data: any }) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.updateMany,
      variables: params,
    })
  }

  delete(resource: string, params: { id: string; previousData?: any }) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.delete,
      variables: params,
    })
  }

  deleteMany(
    resource: string,
    params: { ids: Array<string>; previousData?: any }
  ) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.deleteMany,
      variables: params,
    })
  }
}

type DataProviderProps = {
  children?: React.ReactNode
}

export const ReactAdmin = ({ children }: DataProviderProps) => {
  const apollo = useApolloClient() as ApolloClient<unknown>
  const [dataProvider] = useState<DataProviderInstance>(
    new DataProviderInstance(apollo)
  )
  const theme = useTheme()


  return ( <Admin theme={theme} dataProvider={dataProvider} layout={AdminLayout}>
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
