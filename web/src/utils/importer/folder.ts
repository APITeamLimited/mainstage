import { ImportRequest } from 'insomnia-importers'
import * as Y from 'yjs'

export const handleFolderImport = async ({
  item,
  foundIds,
}: {
  item: ImportRequest
  foundIds: { oldId: string; newId: string }[]
}) => {
  const folder = new Y.Map()
  const folderId = foundIds.find((i) => i.oldId === item._id)?.newId
  if (!folderId) throw new Error('folderId not found')

  folder.set('id', folderId)
  folder.set('name', item.name)
  folder.set('createdAt', new Date().toISOString())
  folder.set('updatedAt', null)
  folder.set('__typename', 'Folder')
  folder.set('parentId', foundIds.find((i) => i.oldId === item.parentId)?.newId)
  folder.set(
    '__parentTypename',
    item.parentId === '__GRP_1__' ? 'Collection' : 'Folder'
  )
  // Skip ordering index for now
  folder.set('orderingIndex', 0)

  folder.set('description', item.description)

  return { folderId, folder }
}
