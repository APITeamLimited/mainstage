import { memo, useEffect, useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import { useThrottle } from '@react-hook/throttle'
import { DragSourceMonitor, useDrag, useDragDropManager } from 'react-dnd'

import {
  LocalFolder,
  LocalRESTRequest,
  localFoldersVar,
  localRESTRequestsVar,
  LocalCollection,
} from 'src/contexts/reactives'

import { focusedElementVar } from '../../reactives'
import { EditNameInput } from '../EditNameInput'

import { ListCollapsible } from './ListCollapsible'
import { NodeActionButton } from './NodeActionButton'
import { useNodeDrop } from './useDrop'
import { deleteRecursive, getNodeIcon } from './utils'
import { DropSpaceBottom, DropSpaceTop } from './utils'

export type NodeItem = LocalFolder | LocalRESTRequest | LocalCollection

export type NodeProps = {
  item: NodeItem
  parentIndex: number
}

export type DropSpace = 'Top' | 'Bottom' | 'Inner' | null

export const Node = ({ item, parentIndex }: NodeProps) => {
  const isRoot = item.__typename === 'LocalCollection'

  const focusedElement = useReactiveVar(focusedElementVar)
  const [collapsed, setCollapsed] = useState(isRoot ? false : true)
  const [renaming, setRenaming] = useState(false)
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const dragDropManager = useDragDropManager()
  const monitor = dragDropManager.getMonitor()
  const [dropSpace, setDropSpace] = useThrottle<DropSpace>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const renamingRef = useRef<HTMLDivElement>(null)
  const [dropResult, setDropResult] = useState<{
    parentIndex: number
    dropItem: LocalFolder | LocalRESTRequest
  } | null>(null)
  const [clientOffset, setClientOffset] = useState<{
    x: number
    y: number
  } | null>(null)

  // If local rest requests change, disable renaming
  useEffect(() => {
    if (item.__typename === 'LocalRESTRequest') {
      setRenaming(false)
    }
  }, [item.__typename, localRESTRequests])

  const [{ isBeingDragged }, drag] = useDrag(() => ({
    type: item.__typename,
    item: {
      dropItem: item,
      parentIndex,
    },
    collect: (monitor: DragSourceMonitor) => ({
      isBeingDragged: monitor.isDragging(),
      indexBeingDraged: parentIndex,
    }),
  }))

  const handleDrop = (
    dropResult: {
      parentIndex: number
      dropItem: LocalFolder | LocalRESTRequest
    },
    clientOffset: {
      x: number
      y: number
    } | null
  ) => {
    const element = itemRef?.current?.getBoundingClientRect()

    if (!element) {
      return
    }

    let calculatedDropSpace: DropSpace = null

    if (!clientOffset) {
      console.log("No clientOffset, can't calculate drop space")
      return
    }

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

    console.log(newOrderingIndex)
    console.log(
      calculatedDropSpace,
      'Dropping ont',
      item.__typename,
      item.orderingIndex,
      dropResult.dropItem.orderingIndex,
      newItem.orderingIndex,
      newItem
    )

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

    const localFoldersThisLevelIds = localFoldersThisLevel.map(
      (item) => item.id
    )

    console.log('newfolders', [
      ...localFolders.filter((i) => !localFoldersThisLevelIds.includes(i.id)),
      ...localFoldersThisLevel,
    ])

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

    console.log(
      'newrestrequests',
      ...localRESTRequests.filter(
        (i) => !localRESTRequestsThisLevelIds.includes(i.id)
      ),
      ...localRESTRequestsThisLevel
    )

    localRESTRequestsVar([
      ...localRESTRequests.filter(
        (i) => !localRESTRequestsThisLevelIds.includes(i.id)
      ),
      ...localRESTRequestsThisLevel,
    ])

    // Set setLastNoneNullDropSpace to null to show processed drop
    //setLastNoneNullDropSpace(null)
  }

  // Handle the cascading delete of this node
  const handleDelete = () => {
    const deleteRecursiveResult = deleteRecursive({
      item,
      localFolders,
      localRESTRequests,
    })

    localFoldersVar(deleteRecursiveResult.localFolders)
    localRESTRequestsVar(deleteRecursiveResult.localRESTRequests)
  }

  const [{ hovered, itemBeingHovered }, drop] = useNodeDrop({
    item,
    handleDrop,
  })

  const handleToggle = (event: MouseEvent) => {
    switch (event.detail) {
      case 2:
        setRenaming(true)
        break
      default:
        setCollapsed(!collapsed)
    }
  }

  const getNodeItemChildren = ({ node }: { node: NodeItem }): NodeItem[] => {
    const unsortedFolders = localFolders.filter(
      (folder) => folder.parentId === node.id
    )

    const unsortedRESTRequests = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === node.id
    )

    const mergedItems = [...unsortedFolders, ...unsortedRESTRequests]

    // Sort mergedItems by orderingIndex
    const sortedItems = mergedItems.sort((a, b) => {
      if (a.orderingIndex < b.orderingIndex) {
        return -1
      }
      if (a.orderingIndex > b.orderingIndex) {
        return 1
      }
      return 0
    })

    let hadToResort = false

    // generate whole new orderingIndexes for items this level
    sortedItems.forEach((item, index) => {
      if (item.orderingIndex !== index) {
        hadToResort = true
        item.orderingIndex = index
      }
    })

    if (hadToResort) {
      const sortedLocalFolders = sortedItems.filter(
        (item) => item.__typename === 'LocalFolder'
      ) as LocalFolder[]

      const sortedLocalRESTRequests = sortedItems.filter(
        (item) => item.__typename === 'LocalRESTRequest'
      ) as LocalRESTRequest[]

      localFoldersVar(sortedLocalFolders)
      localRESTRequestsVar(sortedLocalRESTRequests)
    }

    return sortedItems
  }

  const isInFocus =
    focusedElement?.id === item.id &&
    focusedElement?.__typename === item.__typename

  // Finding which half cursor is in and setting dropSpace
  useEffect(
    () =>
      monitor.subscribeToOffsetChange(() => {
        const offset = monitor.getClientOffset()
        const element = itemRef?.current?.getBoundingClientRect()

        // Positive index differences occur when being dragged below the original position
        const indexDifference = parentIndex - itemBeingHovered?.parentIndex

        if (
          element &&
          offset &&
          hovered // &&
          //Math.abs(indexDifference) >= (isRoot ? 0 : 1)
        ) {
          if (offset.y - element.top > element.height / 2) {
            // If is folder and hovered, perform extra check
            // If more than 10 pixels from bottom set dropSpace to Inner

            if (
              item.__typename === 'LocalFolder' &&
              element.bottom - offset.y > 20
            ) {
              setDropSpace('Inner')
            } else if (indexDifference >= 1) {
              setDropSpace('Bottom')
            }
          } else if (indexDifference <= -1) {
            setDropSpace('Top')
          }
        } else {
          setDropSpace(null)
        }
      }),
    [
      monitor,
      itemRef,
      hovered,
      itemBeingHovered,
      parentIndex,
      item.__typename,
      setDropSpace,
      dropSpace,
    ]
  )

  const handleRename = (newName: string) => {
    if (item.__typename === 'LocalFolder') {
      const newLocalFolders = localFolders.map((folder) => {
        if (folder.id === item.id) {
          return { ...folder, name: newName }
        }
        return folder
      })
      localFoldersVar(newLocalFolders)
    } else if (item.__typename === 'LocalRESTRequest') {
      const newLocalRESTRequests = localRESTRequests.map((restRequest) => {
        if (restRequest.id === item.id) {
          return { ...restRequest, name: newName }
        }
        return restRequest
      })
      localRESTRequestsVar(newLocalRESTRequests)
    }

    setRenaming(false)
  }

  const childNodes = ['LocalCollection', 'LocalFolder'].includes(
    item.__typename
  )
    ? getNodeItemChildren({
        node: item,
      })
    : []

  const innerContent = (childNodes &&
    !collapsed &&
    childNodes.map((childNode, childIndex) => (
      <Node key={childIndex} parentIndex={childIndex} item={childNode} />
    ))) as JSX.Element[]

  // Id the root element, just return innerContent
  return isRoot ? (
    <>{innerContent}</>
  ) : (
    <div ref={itemRef}>
      <div ref={drag}>
        <div ref={drop}>
          {dropSpace === 'Top' && hovered && <DropSpaceTop />}
          <ListItem
            secondaryAction={
              <NodeActionButton item={item} onDelete={handleDelete} />
            }
            sx={{
              paddingTop: 1,
              paddingBottom: 0.5,
              backgroundColor: isInFocus
                ? theme.palette.alternate.main
                : 'inherit',
            }}
            onClick={
              item.__typename === 'LocalRESTRequest'
                ? () => focusedElementVar(item)
                : undefined
            }
          >
            <ListItemIcon
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onClick={
                item.__typename === 'LocalFolder' ? handleToggle : undefined
              }
              color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
            >
              {getNodeIcon(item, collapsed)}
            </ListItemIcon>
            <ListItemText
              primary={
                <EditNameInput
                  name={item.name}
                  setNameCallback={handleRename}
                  isRenaming={renaming}
                  setIsRenamingCallback={setRenaming}
                  renamingRef={renamingRef}
                  singleClickCallback={() => setCollapsed(!collapsed)}
                />
              }
              sx={{
                whiteSpace: 'nowrap',
                marginLeft: -2,
                overflow: 'hidden',
                color: isBeingDragged
                  ? theme.palette.text.secondary
                  : theme.palette.text.primary,
              }}
              secondary={`id: ${item.id} parentIndex: ${parentIndex}, orderingIndex: ${item.orderingIndex} dropSpace ${dropSpace} parentType ${item.__parentTypename}`}
            />
          </ListItem>
          {item.__typename === 'LocalFolder' && (
            <ListCollapsible
              collapsed={collapsed}
              hovered={hovered}
              dropSpace={dropSpace}
              innerContent={innerContent}
            />
          )}
          {dropSpace === 'Bottom' && hovered && <DropSpaceBottom />}
        </div>
      </div>
    </div>
  )
}
