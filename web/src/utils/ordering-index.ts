import type { Doc as YDoc, Map as YMap } from 'yjs'

const SORTABLE_TYPES = ['Collection', 'Folder']

export const buildOrderingIndex = (
  collectionYMap: YMap<any>,
  nodeYMap: YMap<any>
) => {
  if (!SORTABLE_TYPES.includes(nodeYMap.get('__typename'))) {
    return
  }

  const nodeId = nodeYMap.get('id')

  const restRequests = Array.from(
    collectionYMap.get('restRequests').values() as YMap<any>[]
  ).filter((request) => request.get('parentId') === nodeId)

  const folders = Array.from(
    collectionYMap.get('folders').values() as YMap<any>[]
  ).filter((folder) => folder.get('parentId') === nodeId)

  const items = [...folders, ...restRequests].map((item, index) => {
    item.set('orderingIndex', index)
    return item
  })

  items.forEach((item) => buildOrderingIndex(collectionYMap, item))
}
