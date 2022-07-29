export * from './Branch'
export * from './Collection'
export * from './Folder'
export * from './Project'
export * from './RESTRequest'
export * from './RESTResponse'
export * from './Workspace'
export * from './Environment'

export interface BaseEntity {
  id: string
  __typename: string
  createdAt: Date
  updatedAt: Date | null
}
