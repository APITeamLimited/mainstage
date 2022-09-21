import { BaseEntity, RESTAuth } from '.'

export interface Folder extends BaseEntity {
  __typename: 'Folder'
  parentId: string
  __parentTypename: 'Collection' | 'Folder'
  name: string
  orderingIndex: number
  auth: RESTAuth
  description: string
}
