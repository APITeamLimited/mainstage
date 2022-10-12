import { ComponentType, ReactElement } from 'react'

import { ApolloClient } from '@apollo/client'
import { DocumentNode } from 'graphql'

import { UserAdmin } from './users'

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

//export const admins: Array<ValidAdmin> = [UserAdmin]
export const admins: Array<ValidAdmin> = []

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

  async getOne(resource: string, params: { id: string }) {
    const admin = this.getAdmin(resource)

    return (
      await this.apollo.query({
        query: admin.methods.getOne,
        variables: {
          id: params.id,
        },
      })
    ).data[admin.methodNames.getOne]
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
