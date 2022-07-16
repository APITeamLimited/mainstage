export * from './LocalProjects'
export * from './LocalCollections'
export * from './LocalRESTRequests'
export * from './LocalFolders'
export * from './LocalRESTResponses'
export * from './LocalEnvironments'

export interface BaseEntity {
  id: string
  __typename: string
  createdAt: Date
  updatedAt: Date | null
}

export const getUpdatedLocal = <T extends BaseEntity>(local: T) => {
  return {
    ...local,
    updatedAt: new Date(),
  }
}
