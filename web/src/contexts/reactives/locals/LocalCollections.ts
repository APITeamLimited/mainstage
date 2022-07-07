import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

export interface LocalCollection extends BaseLocal {
  __typename: 'LocalCollection'
  parentId: string
  __parentTypename: 'LocalProject'
  name: string
  lastViewedAt: Date | null
}

type GenerateLocalCollectionProps = {
  parentId: string
  name?: string
}

export const generateLocalCollection = ({
  parentId,
  name,
}: GenerateLocalCollectionProps): LocalCollection => {
  return {
    id: uuidv4(),
    name: name || 'New Collection',
    createdAt: new Date(),
    updatedAt: null,
    lastViewedAt: null,
    __typename: 'LocalCollection',
    parentId,
    __parentTypename: 'LocalProject',
  }
}

export const localCollectionsVar = makeVar(<LocalCollection[]>[])
