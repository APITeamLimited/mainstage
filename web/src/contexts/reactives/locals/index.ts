export * from './LocalProjects'
export * from './LocalCollections'
export * from './LocalRESTRequests'
export * from './LocalFolders'
export * from './LocalRESTResponses'

export interface BaseLocal {
  id: string
  __typename: string
  createdAt: Date
  updatedAt: Date | null
}

export const getUpdatedLocal = <T extends BaseLocal>(local: T) => {
  return {
    ...local,
    updatedAt: new Date(),
  }
}
