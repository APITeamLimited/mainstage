import * as Y from 'yjs'

import { DropSpace } from './Node'

type CalculateDropArgs = {
  dropResult: {
    parentIndex: number
    dropItem: Y.Map<any>
  } | null
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

  let calculatedDropSpace: DropSpace = null

  if (clientOffset.y - element.top > element.height / 2) {
    if (
      nodeYMap.get('__typename') === 'Folder' &&
      element.bottom - clientOffset.y > 20
    ) {
      calculatedDropSpace = 'Inner'
    } else {
      calculatedDropSpace = 'Bottom'
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

  const getNewItem = (calculatedDropSpace: DropSpace): Y.Map<any> => {
    if (nodeYMap.get('__parentTypename') === 'Project') {
      throw `Can't drop a project on a project`
    }

    const droppedYMap = dropResult.dropItem

    if (calculatedDropSpace === 'Top') {
      droppedYMap.set('parentId', nodeYMap.get('parentId'))
      droppedYMap.set('__parentTypename', nodeYMap.get('__parentTypename'))
      droppedYMap.set('orderingIndex', nodeYMap.get('orderingIndex') - 0.5)
    } else if (calculatedDropSpace === 'Bottom') {
      droppedYMap.set('parentId', nodeYMap.get('parentId'))
      droppedYMap.set('__parentTypename', nodeYMap.get('__parentTypename'))
      droppedYMap.set('orderingIndex', nodeYMap.get('orderingIndex') + 0.5)
    } else if (calculatedDropSpace === 'Inner') {
      if (nodeYMap.get('__typename') === 'RESTRequest') {
        throw `Can't drop onto a REST request`
      }

      droppedYMap.set('parentId', nodeYMap.get('id'))
      droppedYMap.set('__parentTypename', nodeYMap.get('__typename'))
      droppedYMap.set('orderingIndex', 0)
    } else {
      throw `Unknown drop space ${calculatedDropSpace}`
    }

    return droppedYMap
  }

  const newItem = getNewItem(calculatedDropSpace)

  const itemsThisLevel = [
    ...Array.from(foldersYMap.values()).filter(
      (folder) =>
        folder.get('parentId') === nodeYMap.get('parentId') &&
        folder.get('id') !== newItem.get('id')
    ),
    ...Array.from(restRequestsYMap.values()).filter(
      (request) =>
        request.get('parentId') === nodeYMap.get('parentId') &&
        request.get('id') !== newItem.get('id')
    ),
    newItem,
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
