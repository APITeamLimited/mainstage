import { BaseEntity } from '.'

export interface Project extends BaseEntity {
  __typename: 'Project'
  parentId: string
  __parentTypename: 'Workspace'
  name: string
}
