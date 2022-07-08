import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

export interface LocalFolder extends BaseLocal {
  __typename: 'LocalFolder'
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name: string
  folderIds: string[]
  requestIds: string[]
  orderingIndex: number | undefined
}

type GenerateLocalFolderProps = {
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name?: string
  folderIds: string[]
  requestIds: string[]
  createdAt?: Date | null
  orderingIndex: number | undefined
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
    folderIds,
    requestIds,
    orderingIndex,
  }
}
export const localFoldersVar = makeVar(<LocalFolder[]>[])
