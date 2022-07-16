import {
  LocalFolder,
  localFoldersVar,
  LocalRESTRequest,
  localRESTRequestsVar,
} from 'src/contexts/reactives'

import { DropSpace, NodeItem } from './Node'

type CalculateDropArgs = {
  dropResult: {
    parentIndex: number
    dropItem: LocalFolder | LocalRESTRequest
  } | null
  clientOffset: {
    x: number
    y: number
  } | null
  item: NodeItem
  itemRef: React.RefObject<HTMLDivElement>
  parentIndex: number
  localFolders: LocalFolder[]
  localRESTRequests: LocalRESTRequest[]
  // These will only ever be set null
  setDropResult: (result: null) => void
  setClientOffset: (offset: null) => void
  setDropSpace: (dropSpace: null) => void
}

export const calculateDrop = ({
  dropResult,
  clientOffset,
  item,
  itemRef,
  parentIndex,
  localFolders,
  localRESTRequests,
  setDropResult,
  setClientOffset,
  setDropSpace,
}: CalculateDropArgs) => {
  if (!dropResult || !clientOffset) {
    return
  }

  const element = itemRef?.current?.getBoundingClientRect()

  if (!element) {
    return
  }

  let calculatedDropSpace: DropSpace = null

  if (clientOffset.y - element.top > element.height / 2) {
    if (
      item.__typename === 'LocalFolder' &&
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
    dropResult.dropItem.id === item.id &&
    dropResult.parentIndex === parentIndex &&
    dropResult.dropItem.__typename === item.__typename
  ) {
    return
  }

  const getNewItem = (
    calculatedDropSpace: DropSpace
  ): LocalFolder | LocalRESTRequest => {
    if (item.__parentTypename === 'LocalProject') {
      throw `Can't drop a project on a project`
    }

    if (calculatedDropSpace === 'Top') {
      const newItem = {
        ...dropResult.dropItem,
        parentId: item.parentId,
        __parentTypename: item.__parentTypename,
        orderingIndex: parseFloat(item.orderingIndex.toFixed(2)) - 0.5,
      }
      return newItem
    } else if (calculatedDropSpace === 'Bottom') {
      return {
        ...dropResult.dropItem,
        parentId: item.parentId,
        __parentTypename: item.__parentTypename,
        orderingIndex: parseFloat(item.orderingIndex.toFixed(2)) + 0.5,
      }
    } else if (calculatedDropSpace === 'Inner') {
      if (item.__typename === 'LocalRESTRequest') {
        throw `Can't drop onto a REST request`
      }

      return {
        ...dropResult.dropItem,
        parentId: item.id,
        __parentTypename: item.__typename,
        orderingIndex: 0,
      }
    }

    throw `Unknown drop space ${calculatedDropSpace}`
  }

  // DO NOT REMOVE THE SPREAD OPERATOR!!!
  const newItem = { ...getNewItem(calculatedDropSpace) }

  const newOrderingIndex = newItem.orderingIndex

  //console.log(newOrderingIndex)
  //console.log(
  //  'the type',
  //  dropResult.dropItem.__typename,
  //
  //  calculatedDropSpace,
  //  'Dropping onto',
  //  item.__typename,
  //  item.orderingIndex,
  //  dropResult.dropItem.orderingIndex,
  //  newItem.orderingIndex,
  //  newItem
  //)

  //console.log([...localFolders, ...localRESTRequests])

  const itemsThisLevel = [
    ...localFolders.filter(
      (i) => i.parentId === item.parentId && i.id !== newItem.id
    ),
    ...localRESTRequests.filter(
      (i) => i.parentId === item.parentId && i.id !== newItem.id
    ),
    {
      ...newItem,
      orderingIndex: newOrderingIndex,
    },
  ].sort((a, b) => a.orderingIndex - b.orderingIndex)

  // generate whole new orderingIndexes for items this level
  itemsThisLevel.forEach((item, index) => {
    item.orderingIndex = index
  })

  //console.log('itemsThisLevel3', itemsThisLevel, itemsThisLevel.length)

  // LocalFolders on this level
  const localFoldersThisLevel = itemsThisLevel.filter(
    (item) => item.__typename === 'LocalFolder'
  ) as LocalFolder[]

  const localFoldersThisLevelIds = localFoldersThisLevel.map((item) => item.id)

  //console.log('newfolders', [
  //  ...localFolders.filter((i) => !localFoldersThisLevelIds.includes(i.id)),
  //  ...localFoldersThisLevel,
  //])

  localFoldersVar([
    ...localFolders.filter((i) => !localFoldersThisLevelIds.includes(i.id)),
    ...localFoldersThisLevel,
  ])
  // LocalRESTRequests on this level
  const localRESTRequestsThisLevel = itemsThisLevel.filter(
    (item) => item.__typename === 'LocalRESTRequest'
  ) as LocalRESTRequest[]

  const localRESTRequestsThisLevelIds = localRESTRequestsThisLevel.map(
    (item) => item.id
  )

  //console.log(
  //  'newrestrequests',
  //  ...localRESTRequests.filter(
  //    (i) => !localRESTRequestsThisLevelIds.includes(i.id)
  //  ),
  //  ...localRESTRequestsThisLevel
  //)

  localRESTRequestsVar([
    ...localRESTRequests.filter(
      (i) => !localRESTRequestsThisLevelIds.includes(i.id)
    ),
    ...localRESTRequestsThisLevel,
  ])

  // Cleanup
  setDropResult(null)
  setClientOffset(null)
  setDropSpace(null)
}
