import { BaseEntity, RESTAuth } from '.'

export interface Collection extends BaseEntity {
  __typename: 'Collection'
  parentId: string
  __parentTypename: 'Project'
  name: string
  orderingIndex: number
  auth: RESTAuth
  description: string
}
