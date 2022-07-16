import { useEffect, useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import { useThrottle } from '@react-hook/throttle'
import { useDragDropManager } from 'react-dnd'

import {
  LocalFolder,
  LocalRESTRequest,
  localFoldersVar,
  localRESTRequestsVar,
  LocalCollection,
} from 'src/contexts/reactives'

import { focusedElementVar } from '../../reactives'
import { EditNameInput } from '../EditNameInput'

import { calculateDrop } from './calculateDrop'
import { ListCollapsible } from './ListCollapsible'
import { NodeActionButton } from './NodeActionButton'
import { useNodeDrag } from './useDrag'
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
                backgroundColor: isBeingDragged ? 'red' : 'inherit',
              }}
              secondary={`dropSpace ${
                dropSpace || 'null'
              } parentIndex: ${parentIndex}, orderingIndex: ${
                item.orderingIndex
              } dropSpace ${dropSpace} parentType ${item.__parentTypename}`}
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
