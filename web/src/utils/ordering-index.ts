import * as Y from 'yjs'

const SORTABLE_TYPES = ['Collection', 'Folder']

export const buildOrderingIndex = (
  collectionYMap: Y.Map<any>,
  nodeYMap: Y.Map<any>
) => {
  if (!SORTABLE_TYPES.includes(nodeYMap.get('__typename'))) {
    return
  }

  const nodeId = nodeYMap.get('id')

  const restRequests = Array.from(
    collectionYMap.get('restRequests').values() as Y.Map<any>[]
  ).filter((request) => request.get('parentId') === nodeId)

  const folders = Array.from(
    collectionYMap.get('folders').values() as Y.Map<any>[]
  ).filter((folder) => folder.get('parentId') === nodeId)

  const items = [...folders, ...restRequests].map((item, index) => {
    item.set('orderingIndex', index)
    return item
  })

  items.forEach((item) => buildOrderingIndex(collectionYMap, item))
}
