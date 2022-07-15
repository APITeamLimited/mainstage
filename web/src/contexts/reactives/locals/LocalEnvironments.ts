import { BaseEntity } from '.'

export interface Environment extends BaseEntity {
  __typename: 'LocalEnvironment'
  parentId: string
  __parentTypename: 'LocalCollection'
  name: string
  variables: {
    key: string
    value: string
  }[]
}
