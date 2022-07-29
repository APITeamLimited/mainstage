import { BaseEntity } from '.'

export interface Branch extends BaseEntity {
  __typename: 'Branch'
  parentId: string
  __parentTypename: 'Project'
  name: string
}
