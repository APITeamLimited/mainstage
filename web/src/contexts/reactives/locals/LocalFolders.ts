import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity } from '.'

export interface LocalFolder extends BaseEntity {
  __typename: 'LocalFolder'
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name: string
  folderIds: string[]
  requestIds: string[]
  orderingIndex: number
}

type GenerateLocalFolderProps = {
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name?: string
  folderIds?: string[]
  requestIds?: string[]
  createdAt?: Date | null
  orderingIndex?: number
}

export const generateLocalFolder = ({
  parentId,
  __parentTypename,
  name,
  createdAt,
  folderIds,
  requestIds,
  orderingIndex,
}: GenerateLocalFolderProps): LocalFolder => {
  return {
    id: uuidv4(),
    name: name || 'New Folder',
    createdAt: createdAt || new Date(),
    updatedAt: createdAt ? new Date() : null,
    __typename: 'LocalFolder',
    parentId,
    __parentTypename,
    folderIds: folderIds || [],
    requestIds: requestIds || [],
    orderingIndex: orderingIndex || 0,
  }
}
export const localFoldersVar = makeVar(<LocalFolder[]>[])
