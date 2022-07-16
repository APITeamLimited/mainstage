import { useEffect, useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { useThrottle } from '@react-hook/throttle'
import { useDragDropManager } from 'react-dnd'

import {
  LocalFolder,
  LocalRESTRequest,
  localFoldersVar,
  localRESTRequestsVar,
  LocalCollection,
  generateLocalFolder,
  generateLocalRESTRequest,
} from 'src/contexts/reactives'

import { focusedElementVar } from '../../reactives'

import { calculateDrop } from './calculateDrop'
import { FolderNode } from './FolderNode'
import { RESTRequestNode } from './RESTRequestNode'
import { useNodeDrag } from './useDrag'
import { useNodeDrop } from './useDrop'
import { deleteRecursive } from './utils'
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
  const renamingRef = useRef<HTMLDivElement>(null)
  const [dropResult, setDropResult] = useState<{
    parentIndex: number
    dropItem: LocalFolder | LocalRESTRequest
  } | null>(null)
  const [clientOffset, setClientOffset] = useState<{
    x: number
    y: number
  } | null>(null)

  const [{ isBeingDragged }, drag] = useNodeDrag({ item, parentIndex })

  // If local rest requests change or being dragged, disable renaming
  useEffect(() => {
    if (item.__typename === 'LocalRESTRequest') {
      setRenaming(false)
    } else if (isBeingDragged) {
      setRenaming(false)
    }
  }, [isBeingDragged, item.__typename, localRESTRequests])

  const handleDrop = (
    theDropResult: {
      parentIndex: number
      dropItem: LocalFolder | LocalRESTRequest
    },
    theClientOffset: {
      x: number
      y: number
    } | null
  ) => {
    setDropResult(theDropResult)
    setClientOffset(theClientOffset)
  }

  useEffect(() => {
    calculateDrop({
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
    })
  }, [
    dropResult,
    clientOffset,
    item,
    localFolders,
    localRESTRequests,
    parentIndex,
    setDropSpace,
  ])

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

  const handleNewFolder = () => {
    if (item.__typename === 'LocalRESTRequest') {
      throw 'Cannot create a new folder inside a REST request'
    }

    const foldersOrderingIndex = localFolders.filter(
      (folder) => folder.parentId === item.id
    ).length

    const restRequestsOrderingIndex = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === item.id
    ).length

    const orderingIndex = Math.max(
      foldersOrderingIndex,
      restRequestsOrderingIndex
    )

    localFoldersVar([
      ...localFolders,
      generateLocalFolder({
        name: 'New Folder',
        parentId: item.id,
        __parentTypename: item.__typename,
        orderingIndex,
      }),
    ])
  }

  const handleNewRESTRequest = () => {
    if (item.__typename === 'LocalRESTRequest') {
      throw 'Cannot create a new REST request inside a REST request'
    }

    const foldersOrderingIndex = localFolders.filter(
      (folder) => folder.parentId === item.id
    ).length

    const restRequestsOrderingIndex = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === item.id
    ).length

    const orderingIndex = Math.max(
      foldersOrderingIndex,
      restRequestsOrderingIndex
    )

    localRESTRequestsVar([
      ...localRESTRequests,
      generateLocalRESTRequest({
        name: 'New REST Request',
        parentId: item.id,
        __parentTypename: item.__typename,
        orderingIndex,
      }),
    ])
  }

  const [{ hovered, itemBeingHovered }, drop] = useNodeDrop({
    item,
    handleDrop,
  })

  const handleToggle = () => setCollapsed(!collapsed)

  const getNodeItemChildren = ({ node }: { node: NodeItem }): NodeItem[] => {
    const unsortedFolders = localFolders.filter(
      (folder) => folder.parentId === node.id
    )

    const unsortedRESTRequests = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === node.id
    )

    const mergedItems = [...unsortedFolders, ...unsortedRESTRequests]

    // Sort mergedItems by orderingIndex
    return mergedItems.sort((a, b) => {
      if (a.orderingIndex < b.orderingIndex) {
        return -1
      }
      if (a.orderingIndex > b.orderingIndex) {
        return 1
      }
      return 0
    })
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
        const indexDifference =
          parentIndex -
          (itemBeingHovered as { parentIndex: number })?.parentIndex

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
            } else if (indexDifference > 0) {
              setDropSpace('Bottom')
            }
          } else if (indexDifference < 0) {
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
  return (
    <div ref={itemRef}>
      <div ref={drag}>
        <div ref={drop}>
          {dropSpace === 'Top' && hovered && <DropSpaceTop />}
          {item.__typename === 'LocalCollection' && <>{innerContent}</>}
          {item.__typename === 'LocalRESTRequest' && (
            <RESTRequestNode
              isBeingDragged={isBeingDragged}
              item={item}
              isInFocus={isInFocus}
              renaming={renaming}
              renamingRef={renamingRef}
              setRenaming={setRenaming}
              handleRename={handleRename}
              handleDelete={handleDelete}
              dropSpace={dropSpace}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              parentIndex={parentIndex}
            />
          )}
          {item.__typename === 'LocalFolder' && (
            <FolderNode
              isBeingDragged={isBeingDragged}
              item={item}
              isInFocus={isInFocus}
              renaming={renaming}
              renamingRef={renamingRef}
              setRenaming={setRenaming}
              handleRename={handleRename}
              handleDelete={handleDelete}
              dropSpace={dropSpace}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              hovered={hovered}
              innerContent={innerContent}
              handleToggle={handleToggle}
              handleNewFolder={handleNewFolder}
              handleNewRESTRequest={handleNewRESTRequest}
            />
          )}
          {dropSpace === 'Bottom' && hovered && <DropSpaceBottom />}
        </div>
      </div>
    </div>
  )
}
