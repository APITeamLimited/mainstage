import * as Y from 'yjs'

import { DropSpaceType } from './Node'
import { DragDetails } from './useNodeDrag'

type CalculateDropArgs = {
  dropResult: DragDetails | null
  clientOffset: {
    x: number
    y: number
  } | null
  nodeYMap: Y.Map<any>
  nodeYMapRef: React.RefObject<HTMLDivElement>
  parentIndex: number
  foldersYMap: Y.Map<any>
  restRequestsYMap: Y.Map<any>
  // These will only ever be set null
  setDropResult: (result: null) => void
  setClientOffset: (offset: null) => void
  setDropSpace: (dropSpace: null) => void
}

export const calculateDrop = ({
  dropResult,
  clientOffset,
  nodeYMap,
  nodeYMapRef,
  parentIndex,
  foldersYMap,
  restRequestsYMap,
  setDropResult,
  setClientOffset,
  setDropSpace,
}: CalculateDropArgs) => {
  if (!dropResult || !clientOffset) {
    return
  }

  const element = nodeYMapRef?.current?.getBoundingClientRect()

  if (!element) {
    return
  }

  let calculatedDropSpace: DropSpaceType = null

  if (clientOffset.y - element.top > element.height / 2) {
    if (nodeYMap.get('__typename') === 'Collection') {
      if (clientOffset.y < element.height / 2) {
        calculatedDropSpace = 'Top'
      } else {
        calculatedDropSpace = 'Bottom'
      }
    } else {
      if (
        nodeYMap.get('__typename') === 'Folder' &&
        element.bottom - clientOffset.y > 15
      ) {
        calculatedDropSpace = 'Inner'
      } else {
        calculatedDropSpace = 'Bottom'
      }
    }
  } else {
    calculatedDropSpace = 'Top'
  }

  // Ignore drops on the same node
  if (
    dropResult.dropItem.get('id') === nodeYMap.get('id') &&
    dropResult.parentIndex === parentIndex &&
    dropResult.dropItem.get('__typename') === nodeYMap.get('__typename')
  ) {
    return
  }

  // Ignore drop if parent is the drop item
  if (
    droppingOnSelf({
      nodeYMap,
      dropItem: dropResult.dropItem,
      foldersYMap,
      restRequestsYMap,
    })
  ) {
    return
  }

  const getNewItem = (
    calculatedDropSpace: DropSpaceType
  ): {
    newYMap: Y.Map<any>
    targetYMap: Y.Map<any>
  } => {
    if (nodeYMap.get('__parentTypename') === 'Project') {
      throw `Can't drop a project on a project`
    }

    const droppedYMap = dropResult.dropItem

    let targetYMap: Y.Map<any> | undefined = undefined

    if (nodeYMap.get('__typename') === 'Collection') {
      // Get the last top level item in the collection and use that as the node
      const foldersYMap = nodeYMap.get('folders') as Y.Map<any>
      const restRequestsYMap = nodeYMap.get('restRequests') as Y.Map<any>

      let lastOrderingIndex = -1

      Array.from(foldersYMap.values() as unknown as Y.Map<any>).forEach(
        (folderYMap) => {
          if (folderYMap.get('__parentTypename') === 'Collection') {
            if (folderYMap.get('orderingIndex') > lastOrderingIndex) {
              targetYMap = folderYMap
              lastOrderingIndex = folderYMap.get('orderingIndex') as number
            }
          }
        }
      )

      Array.from(restRequestsYMap.values() as unknown as Y.Map<any>).forEach(
        (restRequestYMap) => {
          if (restRequestYMap.get('__parentTypename') === 'Collection') {
            if (restRequestYMap.get('orderingIndex') > lastOrderingIndex) {
              targetYMap = restRequestYMap
              lastOrderingIndex = restRequestYMap.get('orderingIndex') as number
            }
          }
        }
      )
    } else {
      targetYMap = nodeYMap
    }

    if (!targetYMap) {
      throw `Could not find targetYMap`
    }

    if (calculatedDropSpace === 'Top') {
      droppedYMap.set('parentId', targetYMap.get('parentId'))
      droppedYMap.set('__parentTypename', targetYMap.get('__parentTypename'))
      droppedYMap.set('orderingIndex', targetYMap.get('orderingIndex') - 0.5)
    } else if (calculatedDropSpace === 'Bottom') {
      droppedYMap.set('parentId', targetYMap.get('parentId'))
      droppedYMap.set('__parentTypename', targetYMap.get('__parentTypename'))
      droppedYMap.set('orderingIndex', targetYMap.get('orderingIndex') + 0.5)
    } else if (calculatedDropSpace === 'Inner') {
      if (targetYMap.get('__typename') === 'RESTRequest') {
        throw `Can't drop onto a REST request`
      }

      droppedYMap.set('parentId', targetYMap.get('id'))
      droppedYMap.set('__parentTypename', targetYMap.get('__typename'))
      droppedYMap.set('orderingIndex', 0)
    } else {
      throw `Unknown drop space ${calculatedDropSpace}`
    }

    return {
      newYMap: droppedYMap,
      targetYMap,
    }
  }

  const { newYMap, targetYMap } = getNewItem(calculatedDropSpace)

  const itemsThisLevel = [
    ...Array.from(foldersYMap.values()).filter(
      (folder) =>
        folder.get('parentId') === targetYMap.get('parentId') &&
        folder.get('id') !== targetYMap.get('id')
    ),
    ...Array.from(restRequestsYMap.values()).filter(
      (request) =>
        request.get('parentId') === targetYMap.get('parentId') &&
        request.get('id') !== targetYMap.get('id')
    ),
    targetYMap,
  ].sort((a, b) => a.get('orderingIndex') - b.get('orderingIndex'))

  // generate whole new orderingIndexes for items this level
  itemsThisLevel.forEach((item, index) => item.set('orderingIndex', index))

  // Cleanup
  setDropResult(null)
  setClientOffset(null)
  setDropSpace(null)
}

const droppingOnSelf = ({
  nodeYMap,
  dropItem,
  foldersYMap,
  restRequestsYMap,
}: {
  nodeYMap: Y.Map<any>
  dropItem: Y.Map<any>
  foldersYMap: Y.Map<any>
  restRequestsYMap: Y.Map<any>
}): boolean => {
  if (nodeYMap.get('__typename') === 'Collection') {
    return false
  }

  const parentId = nodeYMap.get('parentId')
  const nodeParentType = nodeYMap.get('__parentTypename')

  if (
    nodeYMap.get('id') === dropItem.get('id') &&
    nodeYMap.get('__typename') === dropItem.get('__typename')
  ) {
    return true
  }

  if (nodeParentType === 'Collection') {
    return (
      nodeYMap.get('id') === dropItem.get('id') &&
      nodeYMap.get('__typename') === dropItem.get('__typename')
    )
  }

  let parentYMap: undefined | Y.Map<any> = undefined

  if (nodeParentType === 'Folder') {
    parentYMap = foldersYMap.get(parentId)
  } else if (nodeParentType === 'RESTRequest') {
    parentYMap = restRequestsYMap.get(parentId)
  }

  if (!parentYMap) {
    throw `Failed to find parent ${parentId}, type ${nodeParentType}`
  }

  return droppingOnSelf({
    nodeYMap: parentYMap,
    dropItem,
    foldersYMap,
    restRequestsYMap,
  })
}
