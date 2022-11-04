import type { ReactElement } from 'react'

import { ApolloClient } from '@apollo/client'
import type { Documentquery } from 'graphql'

import { UserAdmin } from './users'

type FilterArgs = Record<string, unknown>

type SortArgs = {
  field: string
  order: 'ASC' | 'DESC'
}

type ValidMethod = {
  name: string
  query: Documentquery
}

type PaginationArgs = {
  page?: number
  perPage?: number
}

export type ValidAdmin = {
  gqlName: string
  displayName: string
  displayNamePlural: string
  methods: {
    getList: ValidMethod
    getOne: ValidMethod
    getMany: ValidMethod
    getManyReference: ValidMethod
    create: ValidMethod
    update: ValidMethod
    updateMany: ValidMethod
    delete: ValidMethod
    deleteMany: ValidMethod
  }
  admins: {
    show: ReactElement
    list: ReactElement
  }
}

export const admins: Array<ValidAdmin> = [UserAdmin]

export class DataProviderInstance {
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
      pagination?: PaginationArgs
      sort?: SortArgs
      filter?: FilterArgs
    }
  ) {
    const admin = this.getAdmin(resource)

    return (
      await this.apollo.query({
        query: admin.methods.getList.query,
        variables: {
          page: params.pagination?.page,
          perPage: params.pagination?.perPage,
        },
      })
    ).data[admin.getList.name]
  }

  async getOne(resource: string, params: { id: string }) {
    const admin = this.getAdmin(resource)

    return (
      await this.apollo.query({
        query: admin.methods.getOne.query,
        variables: {
          id: params.id,
        },
      })
    ).data[admin.methodNames.getOne]
  }

  getMany(resource: string, params: { ids: Array<string> }) {
    const admin = this.getAdmin(resource)

    return this.apollo.query({
      query: admin.methods.getMany.query,
      variables: params,
    })
  }

  getManyReference(
    resource: string,
    params: {
      target: string
      id: string
      pagination?: PaginationArgs
      sort?: SortArgs
      filter?: FilterArgs
    }
  ) {
    const admin = this.getAdmin(resource)

    return this.apollo.query({
      query: admin.methods.getManyReference.query,
      variables: params,
    })
  }

  create(resource: string, params: { data: any }) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.create.query,
      variables: params,
    })
  }

  update(
    resource: string,
    params: { id: string; data: any; previousData?: any }
  ) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.update.query,
      variables: params,
    })
  }

  updateMany(resource: string, params: { ids: Array<string>; data: any }) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.updateMany.query,
      variables: params,
    })
  }

  delete(resource: string, params: { id: string; previousData?: any }) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.delete.query,
      variables: params,
    })
  }

  deleteMany(
    resource: string,
    params: { ids: Array<string>; previousData?: any }
  ) {
    const admin = this.getAdmin(resource)

    return this.apollo.mutate({
      mutation: admin.methods.deleteMany.query,
      variables: params,
    })
  }
}
