import { BaseEntity } from '.'

export interface Environment extends BaseEntity {
  __typename: 'Environment'
  parentId: string
  __parentTypename: 'Project'
  name: string
  variables: {
    keyString: string
    value: string
    enabled: boolean
  }[]
}
