import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

export interface LocalCollection extends BaseLocal {
  __typename: 'LocalCollection'
  parentId: string
  __parentTypename: 'LocalProject'
  name: string
  lastViewedAt: Date | null
  folderIds: string[]
  requestIds: string[]
}

type GenerateLocalCollectionProps = {
  parentId: string
  name?: string
  createdAt?: Date | null
  lastViewedAt?: Date | undefined | null
}

export const generateLocalCollection = ({
  parentId,
  name,
  createdAt,
  lastViewedAt,
}: GenerateLocalCollectionProps): LocalCollection => {
  return {
    id: uuidv4(),
    name: name || 'New Collection',
    createdAt: createdAt || new Date(),
    updatedAt: createdAt ? new Date() : null,
    __typename: 'LocalCollection',
    parentId,
    __parentTypename: 'LocalProject',
    folderIds: [],
    requestIds: [],
    lastViewedAt: lastViewedAt || null,
  }
}

export const localCollectionsVar = makeVar(<LocalCollection[]>[])
